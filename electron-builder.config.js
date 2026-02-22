/**
 * electron-builder configuration
 * @see https://www.electron.build/configuration
 */
const path = require("path");
const fs = require("fs");

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
  // Note: dist-standalone/ is prepared by electron/prepare-standalone.mjs
  // which resolves symlinks and adds .env defaults
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
      from: "node_modules/prisma",
      to: "node_modules/prisma",
      filter: ["**/*"],
    },
    {
      from: "node_modules/@prisma/engines",
      to: "node_modules/@prisma/engines",
      filter: ["**/*"],
    },
  ],

  /**
   * After @electron/rebuild and packaging, fix the standalone server's
   * better-sqlite3 native module. The standalone copy was built for system
   * Node.js during `next build`, but the forked server runs under Electron's
   * Node.js. @electron/rebuild already rebuilt the project's copy — we just
   * need to copy it into the standalone resources.
   */
  afterPack: async (context) => {
    const rebuiltBinary = path.join(
      process.cwd(),
      "node_modules", "better-sqlite3", "build", "Release", "better_sqlite3.node"
    );

    if (!fs.existsSync(rebuiltBinary)) {
      console.warn("[afterPack] WARNING: rebuilt better-sqlite3 binary not found");
      return;
    }

    // Determine the app resources path (platform-specific)
    let resourcesDir;
    if (context.packager.platform.name === "mac") {
      const appName = context.packager.appInfo.productFilename;
      resourcesDir = path.join(context.appOutDir, `${appName}.app`, "Contents", "Resources");
    } else {
      resourcesDir = path.join(context.appOutDir, "resources");
    }

    // All locations in standalone that have the native module
    const targets = [
      path.join(resourcesDir, "standalone", "node_modules", "better-sqlite3", "build", "Release", "better_sqlite3.node"),
    ];

    // Also find any Next.js trace copies (better-sqlite3-<hash>)
    const nextNodeModules = path.join(resourcesDir, "standalone", ".next", "node_modules");
    if (fs.existsSync(nextNodeModules)) {
      const entries = fs.readdirSync(nextNodeModules);
      for (const entry of entries) {
        if (entry.startsWith("better-sqlite3")) {
          const target = path.join(nextNodeModules, entry, "build", "Release", "better_sqlite3.node");
          if (fs.existsSync(target)) {
            targets.push(target);
          }
        }
      }
    }

    for (const target of targets) {
      if (fs.existsSync(target)) {
        fs.copyFileSync(rebuiltBinary, target);
        console.log(`[afterPack] Patched: ${path.relative(context.appOutDir, target)}`);
      }
    }

    console.log(`[afterPack] Replaced ${targets.length} better-sqlite3 native module(s) with Electron-compatible build`);
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
