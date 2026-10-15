import { createServer } from "node:http";
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json", ".png": "image/png", ".svg": "image/svg+xml",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp",
  ".ico": "image/x-icon", ".ttf": "font/ttf", ".woff": "font/woff", ".woff2": "font/woff2",
  ".mp3": "audio/mpeg", ".ogg": "audio/ogg", ".wav": "audio/wav", ".m4a": "audio/mp4",
};

export function createGameServer(directory, base = "/") {
  const gameRoot = path.resolve(directory);
  if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(base)) throw new Error("Base path must look like / or /pokerogue/.");
  const identity = createHash("sha256").update(gameRoot).digest("hex");
  const server = createServer(async (req, res) => {
    try {
      if (req.method !== "GET" && req.method !== "HEAD") {
        res.writeHead(405, { Allow: "GET, HEAD" }).end();
        return;
      }
      const url = new URL(req.url, "http://localhost");
      if (url.pathname === "/__pokerogue_local__") {
        res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
        res.end(JSON.stringify({ game: "pokerogue", identity, base }));
        return;
      }
      if (base !== "/" && (url.pathname === "/" || url.pathname === base.slice(0, -1))) {
        res.writeHead(302, { Location: base }).end();
        return;
      }
      if (!url.pathname.startsWith(base)) {
        res.writeHead(404).end("Not found");
        return;
      }
      const relative = decodeURIComponent(url.pathname.slice(base.length));
      const file = path.resolve(gameRoot, relative || "index.html");
      if (!file.startsWith(gameRoot + path.sep) || relative.split(/[\\/]/).some(part => part.startsWith("."))) {
        res.writeHead(403).end("Forbidden");
        return;
      }
      const info = await stat(file);
      if (!info.isFile()) {
        res.writeHead(404).end("Not found");
        return;
      }
      const headers = {
        "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "no-cache", "X-Content-Type-Options": "nosniff", "Accept-Ranges": "bytes",
      };
      let start = 0;
      let end = info.size - 1;
      let status = 200;
      if (req.headers.range) {
        const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        if (!range || (!range[1] && !range[2])) {
          res.writeHead(416, { "Content-Range": `bytes */${info.size}` }).end();
          return;
        }
        start = range[1] ? Number(range[1]) : Math.max(0, info.size - Number(range[2]));
        end = range[1] && range[2] ? Math.min(Number(range[2]), end) : end;
        if (start > end || start >= info.size) {
          res.writeHead(416, { "Content-Range": `bytes */${info.size}` }).end();
          return;
        }
        status = 206;
        headers["Content-Range"] = `bytes ${start}-${end}/${info.size}`;
      }
      headers["Content-Length"] = Math.max(0, end - start + 1);
      res.writeHead(status, headers);
      if (req.method === "HEAD" || info.size === 0) {
        res.end();
      } else {
        createReadStream(file, { start, end }).on("error", () => res.destroy()).pipe(res);
      }
    } catch (error) {
      res.writeHead(error.code === "ENOENT" || error.code === "ENOTDIR" ? 404 : 400).end("File unavailable");
    }
  });
  return { server, identity };
}

function openBrowser(url) {
  const command = process.platform === "win32" ? "rundll32.exe" : process.platform === "darwin" ? "open" : "xdg-open";
  const args = process.platform === "win32" ? ["url.dll,FileProtocolHandler", url] : [url];
  const child = spawn(command, args, { detached: true, stdio: "ignore", windowsHide: true });
  child.on("error", () => console.log(`Open this address in your browser: ${url}`));
  child.unref();
}

async function main() {
  const args = process.argv.slice(2);
  const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
  const port = Number(option("--port", "8457"));
  const base = option("--base", "/");
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("Port must be between 1024 and 65535.");
  const buildMarker = path.join(root, "dist/standalone-build.json");
  if (!existsSync(buildMarker) || !JSON.parse(readFileSync(buildMarker, "utf8")).offline) {
    console.log("Preparing the standalone game for the first time...");
    const result = spawnSync(process.execPath, [path.join(root, "scripts/build-offline.mjs")], { cwd: root, stdio: "inherit" });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error("The game could not be built. See the message above.");
  }
  const { server, identity } = createGameServer(path.join(root, "dist"), base);
  const url = `http://127.0.0.1:${port}${base}`;
  try {
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(port, "127.0.0.1", resolve);
    });
  } catch (error) {
    if (error.code === "EADDRINUSE") {
      const running = await fetch(`http://127.0.0.1:${port}/__pokerogue_local__`, { signal: AbortSignal.timeout(2000) })
        .then(res => res.json()).catch(() => null);
      if (running?.identity === identity && running.base === base) {
        console.log(`PokeRogue is already running: ${url}`);
        if (!args.includes("--no-open")) openBrowser(url);
        return;
      }
      throw new Error(`Port ${port} is being used by another program. Close it or launch with --port 8458.`);
    }
    throw error;
  }
  console.log(`\nPokeRogue is ready: ${url}\nKeep this window open while playing. Close it to stop the local game.\nSaves stay in this browser. Use Menu > Manage Data to export a backup.\n`);
  if (!args.includes("--no-open")) openBrowser(url);
  for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, () => server.close(() => process.exit(0)));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(`\nPokeRogue could not start: ${error.message}`); process.exitCode = 1; });
}
