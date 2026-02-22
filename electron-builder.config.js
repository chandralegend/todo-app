/**
 * electron-builder configuration
 * @see https://www.electron.build/configuration
 */
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
  extraResources: [
    {
      from: ".next/standalone",
      to: "standalone",
      filter: ["**/*"],
    },
    {
      from: ".next/static",
      to: "standalone/.next/static",
      filter: ["**/*"],
    },
    {
      from: "public",
      to: "standalone/public",
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
      from: "node_modules/.bin/prisma",
      to: "node_modules/.bin/prisma",
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

  // macOS
  mac: {
    target: [
      {
        target: "dmg",
        arch: ["arm64", "x64"],
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
