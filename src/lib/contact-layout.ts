import { cache } from "react";
import { getSettings, setSetting } from "./settings";

/**
 * The order the contact page stacks its blocks in.
 *
 * Stored as a list of ids rather than positions, so a block added later just
 * appends instead of shifting numbers that are already saved. Anything the
 * stored list does not mention is appended in its declared order, and
 * anything unknown is dropped — a stale setting can never blank the page.
 */

export const LAYOUT_KEY = "contactLayout";

export type BlockId = "departments" | "gallery" | "social";

export const CONTACT_BLOCKS: { id: BlockId; label: string; hint: string }[] = [
  {
    id: "departments",
    label: "بطاقات الأقسام",
    hint: "أرقام الأقسام ومسؤوليها",
  },
  {
    id: "gallery",
    label: "بطاقة معرض المجوهرات",
    hint: "الشعار والنبذة ورابط المعرض",
  },
  {
    id: "social",
    label: "شريط التواصل الاجتماعي",
    hint: "أيقونات المنصات",
  },
];

export const DEFAULT_ORDER: BlockId[] = CONTACT_BLOCKS.map((b) => b.id);

const isBlockId = (value: unknown): value is BlockId =>
  typeof value === "string" && DEFAULT_ORDER.includes(value as BlockId);

/** Cleans a stored list: keeps known ids once each, then appends the rest. */
export function normaliseOrder(saved: unknown): BlockId[] {
  const seen = new Set<BlockId>();
  const out: BlockId[] = [];

  if (Array.isArray(saved)) {
    for (const value of saved) {
      if (isBlockId(value) && !seen.has(value)) {
        seen.add(value);
        out.push(value);
      }
    }
  }
  for (const id of DEFAULT_ORDER) {
    if (!seen.has(id)) out.push(id);
  }
  return out;
}

export const getBlockOrder = cache(async function getBlockOrder(): Promise<BlockId[]> {
  const saved = await getSettings([LAYOUT_KEY]);
  return normaliseOrder(saved[LAYOUT_KEY]);
});

export async function saveBlockOrder(order: BlockId[]) {
  await setSetting(LAYOUT_KEY, normaliseOrder(order));
}
