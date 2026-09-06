import { cache } from "react";
import { getDict, type Dict } from "@/dictionaries";
import type { Locale } from "./i18n";
import { getSettings, setSetting, clearSetting } from "./settings";

/**
 * Editable site copy.
 *
 * The dictionaries in `src/dictionaries` stay the source of truth for every
 * string. The admin panel saves only a *patch* — the fields it actually
 * changed — which is deep-merged over the dictionary at render time. Anything
 * the panel has never touched keeps rendering the value from the code, so new
 * strings added by a developer show up immediately and a wiped setting simply
 * restores the original copy.
 */

export type ContentPatch = Record<string, unknown>;

export const contentKey = (locale: Locale) => `content:${locale}`;

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Merges `patch` over `base`. Objects merge key by key; arrays and scalars are
 * replaced wholesale, so reordering or deleting a list item works as expected.
 */
export function deepMerge<T>(base: T, patch: unknown): T {
  if (!isPlainObject(patch)) return (patch === undefined ? base : (patch as T));
  if (!isPlainObject(base)) return patch as T;

  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    out[key] = isPlainObject(value) ? deepMerge(out[key], value) : value;
  }
  return out as T;
}

/** The dictionary for `locale` with the admin panel's edits applied. */
export const getContent = cache(async function getContent(locale: Locale): Promise<Dict> {
  const base = getDict(locale);
  const saved = await getSettings([contentKey(locale)]);
  const patch = saved[contentKey(locale)];
  return patch ? deepMerge(base, patch) : base;
});

/** The raw saved patch for `locale` — used by the admin editor, not the site. */
export async function getContentPatch(locale: Locale): Promise<ContentPatch> {
  const saved = await getSettings([contentKey(locale)]);
  const patch = saved[contentKey(locale)];
  return isPlainObject(patch) ? patch : {};
}

export async function saveContentPatch(locale: Locale, patch: ContentPatch) {
  await setSetting(contentKey(locale), patch);
}

/** Drops every edit for `locale`, restoring the copy shipped in the code. */
export async function resetContent(locale: Locale) {
  await clearSetting(contentKey(locale));
}

/* ── dot/bracket paths, e.g. "faq.items[2].q" ───────────────────────────── */

function parsePath(path: string): (string | number)[] {
  const parts: (string | number)[] = [];
  for (const seg of path.split(".")) {
    const m = seg.match(/^([^[\]]+)((?:\[\d+\])*)$/);
    if (!m) return [];
    parts.push(m[1]);
    for (const idx of m[2].matchAll(/\[(\d+)\]/g)) parts.push(Number(idx[1]));
  }
  return parts;
}

/** Reads `path` out of a nested object, or `undefined` if any step is missing. */
export function getPath(source: unknown, path: string): unknown {
  let node: unknown = source;
  for (const key of parsePath(path)) {
    if (node == null) return undefined;
    node = (node as Record<string | number, unknown>)[key];
  }
  return node;
}

/** Writes `value` at `path`, creating the objects and arrays along the way. */
export function setPath(target: Record<string, unknown>, path: string, value: unknown) {
  const keys = parsePath(path);
  if (!keys.length) return;

  let node: Record<string | number, unknown> = target;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const nextIsIndex = typeof keys[i + 1] === "number";
    const existing = node[key];
    if (!isPlainObject(existing) && !Array.isArray(existing)) {
      node[key] = nextIsIndex ? [] : {};
    }
    node = node[key] as Record<string | number, unknown>;
  }
  node[keys[keys.length - 1]] = value;
}
