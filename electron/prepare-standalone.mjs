/**
 * Prepare the Next.js standalone output for Electron packaging.
 *
 * Next.js standalone output contains symlinks (e.g., better-sqlite3 trace refs)
 * that break electron-builder's extraResources copy. This script:
 * 1. Copies .next/standalone → dist-standalone/ (resolving symlinks)
 * 2. Copies .next/static → dist-standalone/.next/static
 * 3. Copies public/ → dist-standalone/public
 * 4. Copies the real better-sqlite3 native module (for the standalone server)
 * 5. Generates a .env file with default secrets for the packaged app
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const DEST = path.join(ROOT, "dist-standalone");

// Directories that Next.js standalone copies from the project root
// but are not needed (and harmful) in the packaged app
const EXCLUDE_DIRS = new Set([
  "release",
  "dist-standalone",
  "dist-electron",
  "dist",
  "build",
  "electron",
  ".git",
  ".docs",
]);

function copyDirSync(src, dest, depth = 0) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    // Skip excluded directories at the top level of the standalone copy
    if (depth === 0 && EXCLUDE_DIRS.has(entry.name)) {
      console.log(`  Skipping excluded directory: ${entry.name}/`);
      continue;
    }

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Check if it's a symlink
    const stat = fs.lstatSync(srcPath);
    if (stat.isSymbolicLink()) {
      // Resolve the symlink target
      try {
        const realPath = fs.realpathSync(srcPath);
        const realStat = fs.statSync(realPath);
        if (realStat.isDirectory()) {
          copyDirSync(realPath, destPath, depth + 1);
        } else {
          fs.copyFileSync(realPath, destPath);
        }
      } catch {
        // Broken symlink — skip it
        console.log(`  Skipping broken symlink: ${srcPath}`);
      }
      continue;
    }

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath, depth + 1);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Clean previous output
if (fs.existsSync(DEST)) {
  fs.rmSync(DEST, { recursive: true });
}

console.log("Preparing standalone output for Electron packaging...");

// 1. Copy standalone output (resolving symlinks)
const standaloneDir = path.join(ROOT, ".next", "standalone");
if (!fs.existsSync(standaloneDir)) {
  console.error("ERROR: .next/standalone not found. Run `next build` first.");
  process.exit(1);
}
console.log("  Copying .next/standalone → dist-standalone/");
copyDirSync(standaloneDir, DEST);

// 2. Copy static assets
const staticDir = path.join(ROOT, ".next", "static");
if (fs.existsSync(staticDir)) {
  console.log("  Copying .next/static → dist-standalone/.next/static");
  copyDirSync(staticDir, path.join(DEST, ".next", "static"));
}

// 3. Copy public directory
const publicDir = path.join(ROOT, "public");
if (fs.existsSync(publicDir)) {
  console.log("  Copying public/ → dist-standalone/public");
  copyDirSync(publicDir, path.join(DEST, "public"));
}

// 4. Generate .env with defaults for packaged app
const envPath = path.join(DEST, ".env");
const authSecret = crypto.randomBytes(32).toString("hex");
const envContent = [
  `AUTH_SECRET=${authSecret}`,
  `NEXTAUTH_SECRET=${authSecret}`,
  `NEXTAUTH_URL=http://localhost:3000`,
  "",
].join("\n");
fs.writeFileSync(envPath, envContent);
console.log("  Generated .env with AUTH_SECRET for packaged app");

console.log("Standalone preparation complete.");
