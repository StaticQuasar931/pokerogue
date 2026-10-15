import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const outputRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist");
// The Vite plugin copies and minifies all assets and translations during the build.
for (const required of ["index.html", "asset-manifest.json", "images", "audio", "fonts", "locales/en", "manifest.webmanifest"]) {
  if (!existsSync(path.join(outputRoot, required))) {
    throw new Error(`The build is incomplete: dist/${required} is missing.`);
  }
}
const manifestPath = path.join(outputRoot, "manifest.webmanifest");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
manifest.scope = "./";
manifest.start_url = "./";
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
writeFileSync(path.join(outputRoot, ".nojekyll"), "");

let count = 0;
let largest = { bytes: 0, file: "" };
function checkFiles(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      checkFiles(file);
    } else if (entry.isFile()) {
      const bytes = statSync(file).size;
      count++;
      if (bytes > largest.bytes) largest = { bytes, file: path.relative(outputRoot, file) };
      if (bytes > 20_000_000) throw new Error(`File exceeds the 20 MB limit: ${file} (${bytes} bytes)`);
    } else {
      throw new Error(`Static deployment must contain regular files only: ${file}`);
    }
  }
}
checkFiles(outputRoot);
console.log(`Checked ${count} static files. Largest: ${largest.file} (${largest.bytes} bytes). Every file is below 20 MB.`);
