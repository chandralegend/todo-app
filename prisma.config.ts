import "dotenv/config";
import { defineConfig } from "prisma/config";

/** Default SQLite path for development (Prisma CLI uses this for migrations/seed) */
const DEFAULT_DB_URL = "file:./prisma/dev.db";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx ./prisma/seed.ts",
  },
  datasource: {
    // Electron sets DATABASE_URL at runtime; default to local dev.db for CLI
    url: process.env["DATABASE_URL"] ?? DEFAULT_DB_URL,
  },
});
