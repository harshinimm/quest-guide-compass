import { copyFileSync, cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "dist/extension");

mkdirSync(outDir, { recursive: true });
copyFileSync(resolve(root, "extension/manifest.json"), resolve(outDir, "manifest.json"));

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
