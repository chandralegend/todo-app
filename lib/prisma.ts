import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

/** Default SQLite path for development. Electron sets DATABASE_URL at runtime. */
const DEFAULT_DB_PATH = "./prisma/dev.db";

/** Resolved database file path (without file: prefix). */
export function getDatabasePath(): string {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl) return envUrl.replace("file:", "");
  return DEFAULT_DB_PATH;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({ url: getDatabasePath() });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
