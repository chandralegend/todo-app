import { app } from "electron";
import path from "node:path";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const isDev = !app.isPackaged;

/**
 * Get the database file path.
 * - Dev: ./prisma/dev.db (relative to project root)
 * - Production: ~/Library/Application Support/the-todo-app/todo.db (macOS)
 *               or equivalent on other platform via app.getPath('userData')
 */
export function getDatabasePath(): string {
  if (isDev) {
    return path.join(process.cwd(), "prisma", "dev.db");
  }
  const userDataDir = app.getPath("userData");
  return path.join(userDataDir, "todo.db");
}

/**
 * Get the DATABASE_URL for Prisma (file: protocol).
 */
export function getDatabaseUrl(): string {
  return `file:${getDatabasePath()}`;
}

/**
 * Ensure the database directory exists and run migrations if needed.
 * Uses `prisma migrate deploy` which is safe for production
 * (only applies pending migrations, never resets data).
 */
export function ensureDatabase(): void {
  const dbPath = getDatabasePath();
  const dbDir = path.dirname(dbPath);

  // Ensure the directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbExists = fs.existsSync(dbPath);

  // Set DATABASE_URL for this process and child processes
  process.env.DATABASE_URL = getDatabaseUrl();

  if (!dbExists) {
    console.log(`[electron] Database not found at ${dbPath}, running migrations...`);
  } else {
    console.log(`[electron] Database found at ${dbPath}, checking for pending migrations...`);
  }

  try {
    const migrationsPath = isDev
      ? path.join(process.cwd(), "prisma", "migrations")
      : path.join(process.resourcesPath!, "prisma", "migrations");

    if (fs.existsSync(migrationsPath)) {
      if (isDev) {
        // In dev, use the local prisma CLI
        const prismaBin = path.join(process.cwd(), "node_modules", ".bin", "prisma");
        const prismaSchemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
        execFileSync(prismaBin, ["migrate", "deploy", `--schema=${prismaSchemaPath}`], {
          env: {
            ...process.env,
            DATABASE_URL: getDatabaseUrl(),
          },
          stdio: "pipe",
          cwd: process.cwd(),
        });
      } else {
        // In production, use the lightweight migrate.mjs script instead of
        // the full prisma CLI (which has too many transitive dependencies).
        // The script uses better-sqlite3 directly from the standalone's
        // node_modules to apply .sql migration files.
        const migrateScript = path.join(process.resourcesPath!, "migrate.mjs");
        const standaloneDir = path.join(process.resourcesPath!, "standalone");

        execFileSync(process.execPath, [migrateScript, dbPath, migrationsPath, standaloneDir], {
          env: {
            ...process.env,
            ELECTRON_RUN_AS_NODE: "1",
          },
          stdio: "pipe",
          cwd: process.resourcesPath!,
        });
      }
      console.log("[electron] Migrations applied successfully.");
    } else {
      console.log("[electron] No migrations directory found, skipping migrations.");
    }
  } catch (error) {
    console.error("[electron] Failed to run migrations:", error);
    // Don't crash the app — the DB might still be usable if migrations were already applied
  }
}
