/**
 * Helpers for JSON-serialized array fields in SQLite.
 * PostgreSQL had native String[] but SQLite needs JSON strings.
 */

const ARRAY_FIELDS: Record<string, string[]> = {
  project: ["stack", "tags"],
  article: ["tags"],
};

/** Parse JSON array fields after reading from DB */
export function parseArrays<T>(obj: T | T[] | null, table: string): T | T[] | null {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map((item) => parseArrays(item, table)) as T[];

  const fields = ARRAY_FIELDS[table];
  if (!fields) return obj;

  const result = { ...(obj as Record<string, unknown>) };
  for (const field of fields) {
    const val = result[field];
    if (typeof val === "string" && val.startsWith("[")) {
      try {
        result[field] = JSON.parse(val);
      } catch {
        // Leave as-is if not valid JSON
      }
    }
  }
  return result as T;
}

/** Stringify array fields before writing to DB */
export function stringifyArrays(data: Record<string, unknown>, table: string): Record<string, unknown> {
  const fields = ARRAY_FIELDS[table];
  if (!fields) return data;

  const result = { ...data };
  for (const field of fields) {
    if (field in result && Array.isArray(result[field])) {
      result[field] = JSON.stringify(result[field]);
    }
  }
  return result;
}
