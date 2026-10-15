import { existsSync, writeFileSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const vite = path.join(root, "node_modules/vite/bin/vite.js");
if (!existsSync(vite)) {
  throw new Error("Dependencies are missing. Run pnpm install --frozen-lockfile --ignore-scripts first.");
}
for (const required of ["assets/images", "locales/en"]) {
  if (!existsSync(path.join(root, required))) {
    throw new Error(`Missing ${required}. Run git submodule update --init --recursive first.`);
  }
}
process.chdir(root);
const result = spawnSync(process.execPath, [vite, "build", "--mode", "pages"], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, VITE_BYPASS_LOGIN: "1", VITE_BASE_PATH: process.env.VITE_BASE_PATH || "./" },
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);
await import("./package-static-assets.mjs");
const { version } = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
writeFileSync(path.join(root, "dist/standalone-build.json"), JSON.stringify({ offline: true, version }));
console.log("Standalone PokéRogue is ready. Double-click PLAY.cmd to play.");
