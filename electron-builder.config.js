/**
 * electron-builder configuration
 * @see https://www.electron.build/configuration
 */
const path = require("path");
const fs = require("fs");

/**
 * Recursively copy a directory, preserving structure.
 * Skips broken symlinks and resolves valid ones.
 */
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    const stat = fs.lstatSync(srcPath);
    if (stat.isSymbolicLink()) {
      try {
        const realPath = fs.realpathSync(srcPath);
        if (fs.statSync(realPath).isDirectory()) {
          copyDirSync(realPath, destPath);
        } else {
          fs.copyFileSync(realPath, destPath);
        }
      } catch {
        // Broken symlink — skip
      }
      continue;
    }
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

module.exports = {
  appId: "com.todoapp.desktop",
  productName: "TodoApp",
  copyright: "Copyright 2026",

  // Directories
  directories: {
    output: "release/${version}",
    buildResources: "build",
  },

  // Files to include in the app.asar
  files: [
    "dist-electron/**/*",
  ],

  // Extra resources copied alongside app.asar (not inside it)
  // These are accessible via process.resourcesPath
  //
  // IMPORTANT: electron-builder has a built-in !**/node_modules/** exclusion
  // that cannot be overridden via filters. The standalone's node_modules are
  // copied manually in the afterPack hook below instead.
  extraResources: [
    {
      from: "dist-standalone",
      to: "standalone",
      filter: ["**/*"],
    },
    {
      from: "prisma/migrations",
      to: "prisma/migrations",
      filter: ["**/*"],
    },
    {
      from: "prisma/schema.prisma",
      to: "prisma/schema.prisma",
    },
    {
      from: "electron/migrate.mjs",
      to: "migrate.mjs",
    },
  ],

  /**
   * afterPack hook — runs after electron-builder packages the app but before
   * creating the distributable (DMG/NSIS/AppImage).
   *
   * This hook performs three critical tasks:
   * 1. Copies standalone/node_modules that electron-builder strips out
   * 2. Copies prisma CLI + @prisma/* packages for database migrations
   * 3. Patches better-sqlite3 native module for Electron's Node ABI
   */
  afterPack: async (context) => {
    // Determine the app resources path (platform-specific)
    let resourcesDir;
    if (context.packager.platform.name === "mac") {
      const appName = context.packager.appInfo.productFilename;
      resourcesDir = path.join(context.appOutDir, `${appName}.app`, "Contents", "Resources");
    } else {
      resourcesDir = path.join(context.appOutDir, "resources");
    }

    const standaloneTarget = path.join(resourcesDir, "standalone");

    // ── 1. Copy standalone node_modules ─────────────────────────────────
    // electron-builder's built-in !**/node_modules/** exclusion strips these
    // from extraResources. We copy them manually here.
    const standaloneNodeModulesSrc = path.join(process.cwd(), "dist-standalone", "node_modules");
    const standaloneNodeModulesDest = path.join(standaloneTarget, "node_modules");

    if (fs.existsSync(standaloneNodeModulesSrc)) {
      console.log("[afterPack] Copying standalone/node_modules (stripped by electron-builder)...");
      copyDirSync(standaloneNodeModulesSrc, standaloneNodeModulesDest);
      const count = fs.readdirSync(standaloneNodeModulesDest).length;
      console.log(`[afterPack] Copied ${count} entries to standalone/node_modules`);
    } else {
      console.warn("[afterPack] WARNING: dist-standalone/node_modules not found!");
    }

    // Also copy .next/node_modules if it was stripped
    const nextNodeModulesSrc = path.join(process.cwd(), "dist-standalone", ".next", "node_modules");
    const nextNodeModulesDest = path.join(standaloneTarget, ".next", "node_modules");
    if (fs.existsSync(nextNodeModulesSrc) && !fs.existsSync(nextNodeModulesDest)) {
      console.log("[afterPack] Copying standalone/.next/node_modules...");
      copyDirSync(nextNodeModulesSrc, nextNodeModulesDest);
    }

    // ── 2. Rebuild & patch better-sqlite3 for Electron's Node ABI ─────
    // @electron/rebuild may not correctly rebuild better-sqlite3 for the
    // Electron Node ABI. We force a rebuild with node-gyp targeting the
    // Electron headers to ensure the correct ABI.
    const { execSync } = require("child_process");
    const electronVersion = context.packager.config.electronVersion ||
      require(path.join(process.cwd(), "node_modules", "electron", "package.json")).version;
    const betterSqliteDir = path.join(process.cwd(), "node_modules", "better-sqlite3");

    // Map electron-builder arch names to node-gyp arch names
    const archMap = { arm64: "arm64", x64: "x64", ia32: "ia32" };
    const nodeArch = archMap[context.arch] || process.arch;

    console.log(`[afterPack] Rebuilding better-sqlite3 for Electron ${electronVersion} (arch: ${nodeArch})...`);
    try {
      execSync(
        `npx node-gyp rebuild --target=${electronVersion} --arch=${nodeArch} --dist-url=https://electronjs.org/headers`,
        { cwd: betterSqliteDir, stdio: "pipe", timeout: 120_000 }
      );
      console.log("[afterPack] better-sqlite3 rebuilt for Electron Node ABI");
    } catch (e) {
      console.warn("[afterPack] WARNING: node-gyp rebuild failed:", e.message?.substring(0, 200));
    }

    const rebuiltBinary = path.join(betterSqliteDir, "build", "Release", "better_sqlite3.node");

    if (!fs.existsSync(rebuiltBinary)) {
      console.warn("[afterPack] WARNING: rebuilt better-sqlite3 binary not found");
      return;
    }

    // All locations in standalone that have the native module
    const targets = [
      path.join(standaloneNodeModulesDest, "better-sqlite3", "build", "Release", "better_sqlite3.node"),
    ];

    // Also find any Next.js trace copies (better-sqlite3-<hash>)
    if (fs.existsSync(nextNodeModulesDest)) {
      const entries = fs.readdirSync(nextNodeModulesDest);
      for (const entry of entries) {
        if (entry.startsWith("better-sqlite3")) {
          const target = path.join(nextNodeModulesDest, entry, "build", "Release", "better_sqlite3.node");
          if (fs.existsSync(target)) {
            targets.push(target);
          }
        }
      }
    }

    let patched = 0;
    for (const target of targets) {
      if (fs.existsSync(target)) {
        fs.copyFileSync(rebuiltBinary, target);
        console.log(`[afterPack] Patched: ${path.relative(context.appOutDir, target)}`);
        patched++;
      }
    }

    console.log(`[afterPack] Patched ${patched} better-sqlite3 native module(s) with Electron-compatible build`);
  },

  // macOS
  mac: {
    target: [
      {
        target: "dmg",
        arch: ["arm64"],
      },
    ],
    category: "public.app-category.productivity",
    icon: "build/icon.icns",
  },

  dmg: {
    contents: [
      {
        x: 130,
        y: 220,
      },
      {
        x: 410,
        y: 220,
        type: "link",
        path: "/Applications",
      },
    ],
  },

  // Windows
  win: {
    target: [
      {
        target: "nsis",
        arch: ["x64"],
      },
    ],
    icon: "build/icon.ico",
  },

  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
  },

  // Linux
  linux: {
    target: [
      {
        target: "AppImage",
        arch: ["x64"],
      },
    ],
    category: "Office",
    icon: "build/icon.png",
  },
};
