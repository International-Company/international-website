import { cache } from "react";
import { getSettings, setSetting } from "./settings";

/**
 * Social profiles and per-department phone numbers.
 *
 * Both are language-independent — a phone number and a Facebook URL are the
 * same in Arabic and English — so they live here rather than in the per-locale
 * content patch. Only the display names carry both languages, side by side in
 * one editor, which keeps the numbers from drifting apart between locales.
 */

export const SOCIAL_KEY = "social";
export const DEPARTMENTS_KEY = "departments";

/* ── platforms ─────────────────────────────────────────────────────────── */

export type PlatformId =
  | "whatsapp"
  | "facebook"
  | "instagram"
  | "telegram"
  | "x"
  | "tiktok"
  | "youtube"
  | "linkedin";

export type Platform = {
  id: PlatformId;
  label: string;
  /** English name, used as the accessible label on the English site. */
  labelEn: string;
  /** Brand colour, used on hover so the row stays calm at rest. */
  color: string;
  /** Shown in the admin panel so the user knows what to paste. */
  placeholder: string;
};

export const PLATFORMS: Platform[] = [
  {
    id: "whatsapp",
    label: "واتساب",
    labelEn: "WhatsApp",
    color: "#25d366",
    placeholder: "https://wa.me/972598650998",
  },
  {
    id: "facebook",
    label: "فيسبوك",
    labelEn: "Facebook",
    color: "#1877f2",
    placeholder: "https://facebook.com/yourpage",
  },
  {
    id: "instagram",
    label: "إنستغرام",
    labelEn: "Instagram",
    color: "#e1306c",
    placeholder: "https://instagram.com/youraccount",
  },
  {
    id: "telegram",
    label: "تيليغرام",
    labelEn: "Telegram",
    color: "#229ed9",
    placeholder: "https://t.me/yourchannel",
  },
  {
    id: "x",
    label: "إكس (تويتر)",
    labelEn: "X",
    color: "#e7e9ea",
    placeholder: "https://x.com/youraccount",
  },
  {
    id: "tiktok",
    label: "تيك توك",
    labelEn: "TikTok",
    color: "#ff0050",
    placeholder: "https://tiktok.com/@youraccount",
  },
  {
    id: "youtube",
    label: "يوتيوب",
    labelEn: "YouTube",
    color: "#ff0000",
    placeholder: "https://youtube.com/@yourchannel",
  },
  {
    id: "linkedin",
    label: "لينكدإن",
    labelEn: "LinkedIn",
    color: "#0a66c2",
    placeholder: "https://linkedin.com/company/yourcompany",
  },
];

export const findPlatform = (id: string) => PLATFORMS.find((p) => p.id === id);

/* ── stored shapes ─────────────────────────────────────────────────────── */

/** One social profile. An empty `url` means "not set" and is never rendered. */
export type SocialLink = { platform: string; url: string };

export type Department = {
  /** Emoji shown on the card. */
  icon: string;
  nameAr: string;
  nameEn: string;
  /** Who runs the desk. Optional — the card simply omits the line. */
  personAr: string;
  /** Latin spelling for the English site; falls back to the Arabic name. */
  personEn: string;
  /** Free-form, shown as typed and dialled with the spaces stripped. */
  phone: string;
  /** Digits only, no "+" — goes straight into a wa.me link. Optional. */
  whatsapp: string;
  email: string;
};

/**
 * The four business lines, ready for the admin to fill in.
 *
 * Numbers start empty on purpose: a department with no phone is skipped on the
 * public page, so the section stays honest until real numbers are entered.
 */
const blankDept = { personAr: "", personEn: "", phone: "", whatsapp: "", email: "" };

export const DEFAULT_DEPARTMENTS: Department[] = [
  { icon: "💸", nameAr: "الحوالات المالية", nameEn: "Money Remittances", ...blankDept },
  { icon: "🌐", nameAr: "التحويلات الدولية", nameEn: "International Transfers", ...blankDept },
  { icon: "💱", nameAr: "صرافة العملات", nameEn: "Currency Exchange", ...blankDept },
  { icon: "◈", nameAr: "الذهب والمجوهرات", nameEn: "Gold & Jewelry", ...blankDept },
];

/* ── safety ────────────────────────────────────────────────────────────── */

/**
 * Only lets through link schemes that are safe in an `href`.
 *
 * These URLs are typed into the admin panel and rendered straight onto the
 * public site, so a `javascript:` value would be a stored XSS. A bare domain
 * is upgraded to https rather than rejected, since that is what people paste.
 */
export function safeUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return "";

  if (/^(https?:|mailto:|tel:)/i.test(value)) {
    try {
      return new URL(value).toString();
    } catch {
      return "";
    }
  }
  // Reject anything else with a scheme — javascript:, data:, vbscript: …
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return "";

  try {
    return new URL(`https://${value}`).toString();
  } catch {
    return "";
  }
}

/** Strips everything but digits, for building a wa.me or tel: link. */
export const digits = (value: string) => value.replace(/[^0-9]/g, "");

/**
 * Honorifics people put before a name — "أ. محمد", "الأستاذ محمد", "Mr. Ali".
 * Arabic names are almost always written with one, and taking the very first
 * letter would label every single person "أ".
 */
const HONORIFIC =
  /^\s*(?:[أادمهةحس]\s*\.\s*|(?:الأستاذ|الاستاذ|الدكتور|المهندس|السيد|الحاج|الشيخ|الآنسة)[ةه]?\s+|(?:Mr|Mrs|Ms|Miss|Dr|Eng|Prof)\.?\s+)+/i;

/**
 * A kunya — "أبو محمد", "أم عبدالله" — names someone after their child, so its
 * first letter is always أ and tells two people apart no better than a title.
 * Only stripped when a name follows it.
 */
const KUNYA = /^\s*(?:أب[وا]|ابو|أم|ام|ابن|بن|بنت)\s+(?=\S)/;

/**
 * First letter of the person's actual given name, for the avatar badge.
 * Returns an empty string when there is nothing usable to show.
 */
export function nameInitial(name: string): string {
  const stripped = name.replace(HONORIFIC, "").replace(KUNYA, "").trim();
  return (stripped || name.trim()).charAt(0);
}

/* ── reads ─────────────────────────────────────────────────────────────── */

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/** Social profiles that are actually filled in, in platform order. */
export const getSocialLinks = cache(async function getSocialLinks(): Promise<
  { platform: Platform; url: string }[]
> {
  const saved = await getSettings([SOCIAL_KEY]);
  const rows = asArray<SocialLink>(saved[SOCIAL_KEY]);
  const byId = new Map(rows.map((r) => [r.platform, r.url]));

  return PLATFORMS.flatMap((platform) => {
    const url = safeUrl(String(byId.get(platform.id) ?? ""));
    return url ? [{ platform, url }] : [];
  });
});

/** The raw saved list — used by the admin editor, which shows empty rows too. */
export async function getSocialSettings(): Promise<Record<string, string>> {
  const saved = await getSettings([SOCIAL_KEY]);
  const rows = asArray<SocialLink>(saved[SOCIAL_KEY]);
  const out: Record<string, string> = {};
  for (const row of rows) {
    if (findPlatform(row.platform)) out[row.platform] = String(row.url ?? "");
  }
  return out;
}

/** Departments as stored — including ones with no number yet. */
export const getDepartments = cache(async function getDepartments(): Promise<Department[]> {
  const saved = await getSettings([DEPARTMENTS_KEY]);
  const rows = asArray<Partial<Department>>(saved[DEPARTMENTS_KEY]);
  if (!rows.length) return DEFAULT_DEPARTMENTS;

  return rows.map((row) => ({
    icon: String(row.icon ?? "").trim(),
    nameAr: String(row.nameAr ?? "").trim(),
    nameEn: String(row.nameEn ?? "").trim(),
    personAr: String(row.personAr ?? "").trim(),
    personEn: String(row.personEn ?? "").trim(),
    phone: String(row.phone ?? "").trim(),
    whatsapp: digits(String(row.whatsapp ?? "")),
    email: String(row.email ?? "").trim(),
  }));
});

/** Departments the public page should render — a name and a way to reach them. */
export async function getPublicDepartments(): Promise<Department[]> {
  const rows = await getDepartments();
  return rows.filter(
    (d) => (d.nameAr || d.nameEn) && (d.phone || d.whatsapp || d.email)
  );
}

/* ── writes ────────────────────────────────────────────────────────────── */

export async function saveSocialLinks(links: SocialLink[]) {
  await setSetting(SOCIAL_KEY, links);
}

export async function saveDepartments(departments: Department[]) {
  await setSetting(DEPARTMENTS_KEY, departments);
}
