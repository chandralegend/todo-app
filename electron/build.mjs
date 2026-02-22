import { build } from "esbuild";

const shared = {
  bundle: true,
  platform: "node",
  target: "node22",
  outdir: "dist-electron",
  sourcemap: true,
  // Electron and Node builtins must stay external
  external: ["electron"],
};

// Main process — bundles node-cron and other deps inline
await build({
  ...shared,
  entryPoints: [
    "electron/main.ts",
    "electron/cron.ts",
    "electron/database.ts",
    "electron/server.ts",
    "electron/menu.ts",
  ],
  format: "cjs",
});

// Preload script — runs in renderer context, must be separate
await build({
  ...shared,
  entryPoints: ["electron/preload.ts"],
  format: "cjs",
});

console.log("Electron build complete");
