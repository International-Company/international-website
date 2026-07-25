import ar from "./ar";
import en from "./en";
import type { Locale } from "@/lib/i18n";

export type Dict = typeof ar;

const dictionaries: Record<Locale, Dict> = { ar, en };

export function getDict(locale: Locale): Dict {
  return dictionaries[locale];
}
