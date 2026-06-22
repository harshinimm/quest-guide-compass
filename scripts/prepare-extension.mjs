import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "dist/extension");

mkdirSync(outDir, { recursive: true });

// Copy manifest
writeFileSync(
  resolve(outDir, "manifest.json"),
  readFileSync(resolve(root, "extension/manifest.json"), "utf-8")
);

// Copy the Vite-built HTML files (these have CSS/JS injected by Vite)
// Vite outputs them to dist/extension/extension/ — we move them to the root
const popupHtml = readFileSync(resolve(outDir, "extension/popup.html"), "utf-8");
writeFileSync(resolve(outDir, "popup.html"), popupHtml);

const settingsHtml = readFileSync(resolve(outDir, "extension/settings.html"), "utf-8");
writeFileSync(resolve(outDir, "settings.html"), settingsHtml);

// Copy icons
const iconsOut = resolve(outDir, "icons");
mkdirSync(iconsOut, { recursive: true });

const iconsDir = resolve(root, "extension/public/icons");
if (existsSync(iconsDir)) {
  cpSync(iconsDir, iconsOut, { recursive: true });
} else {
  const placeholderIcon = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYGD4DwABBAEA2R2oPQAAAABJRU5ErkJggg==",
    "base64"
  );
  for (const name of ["icon16.png", "icon48.png", "icon128.png"]) {
    writeFileSync(resolve(iconsOut, name), placeholderIcon);
  }
}

console.log("Extension assets prepared in dist/extension");