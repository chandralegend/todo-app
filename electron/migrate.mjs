/**
 * Lightweight SQLite migration runner for the packaged Electron app.
 *
 * Replaces `prisma migrate deploy` to avoid shipping the entire prisma CLI
 * with its deep dependency tree. Reads .sql migration files and applies
 * them in order, tracking applied migrations in a _prisma_migrations table
 * (compatible with Prisma's migration table format).
 *
 * Usage: node migrate.mjs <database-path> <migrations-dir> <standalone-dir>
 *
 * This script is run by the Electron main process via execFileSync with
 * ELECTRON_RUN_AS_NODE=1. It loads better-sqlite3 from the standalone's
 * .next/node_modules/ (which has the Electron-ABI-patched native binary)
 * rather than from standalone/node_modules/ (which may have the wrong ABI).
 */

import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const [, , dbPath, migrationsDir, standaloneDir] = process.argv;

if (!dbPath || !migrationsDir || !standaloneDir) {
  console.error("Usage: node migrate.mjs <database-path> <migrations-dir> <standalone-dir>");
  process.exit(1);
}

/**
 * Load better-sqlite3 with fallback paths.
 *
 * The standalone output has better-sqlite3 in two locations:
 *   1. standalone/node_modules/better-sqlite3/       (may have wrong Node ABI)
 *   2. standalone/.next/node_modules/better-sqlite3-<hash>/  (patched for Electron ABI)
 *
 * We try the .next/node_modules trace copy first (which afterPack patches),
 * then fall back to the regular node_modules path.
 */
function loadBetterSqlite3() {
  // Try .next/node_modules trace copies first (afterPack patches these for Electron ABI)
  const nextNodeModules = path.join(standaloneDir, ".next", "node_modules");
  if (fs.existsSync(nextNodeModules)) {
    const entries = fs.readdirSync(nextNodeModules);
    for (const entry of entries) {
      if (entry.startsWith("better-sqlite3")) {
        const modPath = path.join(nextNodeModules, entry);
        try {
          const req = createRequire(path.join(modPath, "package.json"));
          return req(".");
        } catch (e) {
          console.log(`  Trace copy ${entry} failed: ${e.message?.substring(0, 100)}`);
        }
      }
    }
  }

  // Fallback: try from standalone/node_modules
  try {
    const req = createRequire(path.join(standaloneDir, "node_modules", "better-sqlite3", "package.json"));
    return req(".");
  } catch (e) {
    console.log(`  standalone/node_modules failed: ${e.message?.substring(0, 100)}`);
  }

  // Last resort: NODE_PATH resolution
  const require = createRequire(import.meta.url);
  return require("better-sqlite3");
}

const Database = loadBetterSqlite3();

// Open or create the database
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

// Ensure the _prisma_migrations table exists (Prisma-compatible schema)
db.exec(`
  CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id"                    TEXT PRIMARY KEY NOT NULL,
    "checksum"              TEXT NOT NULL,
    "finished_at"           DATETIME,
    "migration_name"        TEXT NOT NULL,
    "logs"                  TEXT,
    "rolled_back_at"        DATETIME,
    "started_at"            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count"   INTEGER NOT NULL DEFAULT 0
  );
`);

// Get already-applied migrations
const applied = new Set(
  db.prepare("SELECT migration_name FROM _prisma_migrations WHERE rolled_back_at IS NULL")
    .all()
    .map((row) => row.migration_name)
);

// Read migration directories (sorted by name = chronological order)
if (!fs.existsSync(migrationsDir)) {
  console.log("No migrations directory found, nothing to apply.");
  process.exit(0);
}

const migrationDirs = fs
  .readdirSync(migrationsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

let appliedCount = 0;

for (const migrationName of migrationDirs) {
  if (applied.has(migrationName)) {
    continue; // Already applied
  }

  const sqlFile = path.join(migrationsDir, migrationName, "migration.sql");
  if (!fs.existsSync(sqlFile)) {
    console.warn(`  Skipping ${migrationName}: no migration.sql found`);
    continue;
  }

  const sql = fs.readFileSync(sqlFile, "utf-8");
  const checksum = crypto.createHash("sha256").update(sql).digest("hex");

  console.log(`  Applying migration: ${migrationName}`);

  const id = crypto.randomUUID();
  const startedAt = new Date().toISOString();

  try {
    db.exec(sql);

    // Record the migration
    db.prepare(`
      INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, started_at, applied_steps_count)
      VALUES (?, ?, ?, ?, ?, 1)
    `).run(id, checksum, new Date().toISOString(), migrationName, startedAt);

    appliedCount++;
    console.log(`  Applied: ${migrationName}`);
  } catch (err) {
    console.error(`  FAILED: ${migrationName}: ${err.message}`);
    // Record the failed migration
    db.prepare(`
      INSERT INTO "_prisma_migrations" (id, checksum, migration_name, started_at, applied_steps_count, logs)
      VALUES (?, ?, ?, ?, 0, ?)
    `).run(id, checksum, migrationName, startedAt, err.message);

    db.close();
    process.exit(1);
  }
}

db.close();

if (appliedCount > 0) {
  console.log(`Applied ${appliedCount} migration(s) successfully.`);
} else {
  console.log("All migrations already applied.");
}
