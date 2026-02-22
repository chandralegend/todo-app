import { app } from "electron";
import path from "node:path";
import fs from "node:fs";
import { execSync } from "node:child_process";

const isDev = !app.isPackaged;

/**
 * Get the database file path.
 * - Dev: ./prisma/dev.db (relative to project root)
 * - Production: ~/Library/Application Support/the-todo-app/todo.db (macOS)
 *               or equivalent on other platforms via app.getPath('userData')
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
    // Determine the path to the prisma CLI
    // In dev, use npx; in production, we'll bundle the prisma binary
    const prismaSchemaPath = isDev
      ? path.join(process.cwd(), "prisma", "schema.prisma")
      : path.join(process.resourcesPath!, "prisma", "schema.prisma");

    const migrationsPath = isDev
      ? path.join(process.cwd(), "prisma", "migrations")
      : path.join(process.resourcesPath!, "prisma", "migrations");

    // Only run migrations if the migrations directory exists
    if (fs.existsSync(migrationsPath)) {
      const prismaBin = isDev
        ? path.join(process.cwd(), "node_modules", ".bin", "prisma")
        : path.join(process.resourcesPath!, "node_modules", ".bin", "prisma");

      execSync(
        `"${prismaBin}" migrate deploy --schema="${prismaSchemaPath}"`,
        {
          env: {
            ...process.env,
            DATABASE_URL: getDatabaseUrl(),
          },
          stdio: "pipe",
          cwd: isDev ? process.cwd() : process.resourcesPath!,
        }
      );
      console.log("[electron] Migrations applied successfully.");
    } else {
      console.log("[electron] No migrations directory found, skipping migrations.");
    }
  } catch (error) {
    console.error("[electron] Failed to run migrations:", error);
    // Don't crash the app — the DB might still be usable if migrations were already applied
  }
}
