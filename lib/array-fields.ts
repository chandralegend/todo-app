/**
 * Helpers for JSON-serialized array fields in SQLite.
 *
 * SQLite doesn't support native array columns so Prisma stores them as
 * JSON strings (e.g. '["tag1","tag2"]'). These helpers handle the
 * serialization boundary so the rest of the app works with plain arrays.
 */

/** Parse a JSON string column into a string array. */
export function parseTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Serialize a string array into a JSON string for storage. */
export function serializeTags(tags: string[]): string {
  return JSON.stringify(tags);
}

/** Parse a JSON string column into a number array (for daysOfWeek). */
export function parseDaysOfWeek(raw: string | null | undefined): number[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(Number) : [];
  } catch {
    return [];
  }
}

/** Serialize a number array into a JSON string for storage. */
export function serializeDaysOfWeek(days: number[]): string {
  return JSON.stringify(days);
}
