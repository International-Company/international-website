import { cache } from "react";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  WHATSAPP_NUMBER,
  FORMSUBMIT_ID,
  SITE_URL,
} from "./site";
import { getSettings, setSetting } from "./settings";

/**
 * Contact details and the announcement bar — everything the panel edits that
 * is not page copy. Values in `src/lib/site.ts` remain the defaults, so the
 * site keeps working with no database and an empty field falls back rather
 * than rendering blank.
 */

export const SITE_KEY = "site";
export const ANNOUNCE_KEY = "announce";

export type SiteConfig = {
  phone: string;
  email: string;
  /** Digits only, no "+" — this goes straight into a wa.me link. */
  whatsapp: string;
  formsubmitId: string;
  siteUrl: string;
};

export type Announcement = {
  enabled: boolean;
  ar: string;
  en: string;
  /** Optional link the bar points at. */
  href: string;
  tone: "gold" | "info" | "alert";
};

export const DEFAULT_SITE: SiteConfig = {
  phone: CONTACT_PHONE,
  email: CONTACT_EMAIL,
  whatsapp: WHATSAPP_NUMBER,
  formsubmitId: FORMSUBMIT_ID,
  siteUrl: SITE_URL,
};

export const DEFAULT_ANNOUNCE: Announcement = {
  enabled: false,
  ar: "",
  en: "",
  href: "",
  tone: "gold",
};

/** Keeps a saved-but-empty field from blanking out the default. */
function withDefaults<T extends Record<string, unknown>>(saved: unknown, base: T): T {
  if (typeof saved !== "object" || saved === null) return base;
  const out = { ...base };
  for (const key of Object.keys(base) as (keyof T)[]) {
    const value = (saved as Record<string, unknown>)[key as string];
    if (typeof value === "boolean") {
      out[key] = value as T[keyof T];
    } else if (typeof value === "string" && value.trim()) {
      out[key] = value.trim() as T[keyof T];
    } else if (typeof value === "number") {
      out[key] = value as T[keyof T];
    }
  }
  return out;
}

export const getSiteConfig = cache(async function getSiteConfig(): Promise<SiteConfig> {
  const saved = await getSettings([SITE_KEY]);
  return withDefaults(saved[SITE_KEY], DEFAULT_SITE);
});

export const getAnnouncement = cache(async function getAnnouncement(): Promise<Announcement> {
  const saved = await getSettings([ANNOUNCE_KEY]);
  const merged = withDefaults(saved[ANNOUNCE_KEY], DEFAULT_ANNOUNCE);
  // An enabled bar with no text on either locale would render an empty strip.
  if (!merged.ar.trim() && !merged.en.trim()) merged.enabled = false;
  return merged;
});

export async function saveSiteConfig(config: Partial<SiteConfig>) {
  await setSetting(SITE_KEY, { ...(await getSiteConfig()), ...config });
}

export async function saveAnnouncement(announce: Announcement) {
  await setSetting(ANNOUNCE_KEY, announce);
}

/** Strips everything but digits so a pasted "+970 59…" still builds a wa.me link. */
export const waDigits = (value: string) => value.replace(/[^0-9]/g, "");
