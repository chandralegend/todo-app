import { prisma } from "@/lib/prisma";

/** Known setting keys */
export const SETTING_KEYS = {
  OPENAI_API_KEY: "openai_api_key",
  CURSOR_ENABLED: "cursor_enabled",
} as const;

/**
 * Get a single setting value. Returns null if not set.
 */
export async function getSetting(key: string): Promise<string | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = await (prisma as any).appSetting.findUnique({ where: { key } });
  return row?.value ?? null;
}

/**
 * Set a single setting value (upsert).
 */
export async function setSetting(key: string, value: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).appSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

/**
 * Get all settings as a key-value map.
 */
export async function getAllSettings(): Promise<Record<string, string>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await (prisma as any).appSetting.findMany();
  const map: Record<string, string> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const row of rows as any[]) {
    map[row.key] = row.value;
  }
  return map;
}

/**
 * Get the OpenAI API key — checks database first, then falls back to env var.
 */
export async function getOpenAIApiKey(): Promise<string | undefined> {
  const dbKey = await getSetting(SETTING_KEYS.OPENAI_API_KEY);
  if (dbKey) return dbKey;
  return process.env.OPENAI_API_KEY;
}
