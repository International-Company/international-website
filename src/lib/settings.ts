import { cache } from "react";
import { prisma, safeDb, hasDb } from "./db";

/**
 * Thin JSON layer over the `Setting` key/value table.
 *
 * Everything the admin panel edits outside of rates and requests lives here as
 * a JSON blob, so new editable fields never need a migration. Reads are cached
 * for the lifetime of a request and always fall back to the value baked into
 * the code, which keeps the public site rendering when the database is absent.
 */

/** Reads one JSON setting, returning `fallback` when unset or unparseable. */
export const getSetting = cache(async function getSetting<T>(
  key: string,
  fallback: T
): Promise<T> {
  const row = await safeDb(() => prisma.setting.findUnique({ where: { key } }), null);
  if (!row) return fallback;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    console.error(`[settings] "${key}" holds invalid JSON — using the default`);
    return fallback;
  }
});

/** Reads several JSON settings in one query. */
export const getSettings = cache(async function getSettings(
  keys: string[]
): Promise<Record<string, unknown>> {
  const rows = await safeDb(
    () => prisma.setting.findMany({ where: { key: { in: keys } } }),
    [] as { key: string; value: string }[]
  );
  const out: Record<string, unknown> = {};
  for (const row of rows) {
    try {
      out[row.key] = JSON.parse(row.value);
    } catch {
      /* ignore a corrupt row — the caller's default wins */
    }
  }
  return out;
});

/** Writes one JSON setting. Throws when no database is configured. */
export async function setSetting(key: string, value: unknown): Promise<void> {
  if (!hasDb) throw new Error("no-database");
  const json = JSON.stringify(value);
  await prisma.setting.upsert({
    where: { key },
    update: { value: json },
    create: { key, value: json },
  });
}

/** Removes a setting so the code default takes over again. */
export async function clearSetting(key: string): Promise<void> {
  if (!hasDb) throw new Error("no-database");
  await prisma.setting.deleteMany({ where: { key } });
}
