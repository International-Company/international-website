"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma, hasDb } from "@/lib/db";
import { checkPassword, createSession, destroySession, isAuthed } from "@/lib/auth";
import { DEFAULT_RATES } from "@/lib/rates-data";
import { getDict } from "@/dictionaries";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import {
  deepMerge,
  getContentPatch,
  getPath,
  resetContent,
  saveContentPatch,
  setPath,
  type ContentPatch,
} from "@/lib/content";
import { findGroup, groupBlocks, type Field } from "@/lib/content-schema";
import { isMediaSlot } from "@/lib/media";
import { MAX_UPLOAD_BYTES, ALLOWED_MIME } from "@/lib/media-constants";
import {
  saveAnnouncement,
  saveSiteConfig,
  waDigits,
  type Announcement,
} from "@/lib/site-config";
import {
  PLATFORMS,
  digits,
  safeUrl,
  saveDepartments,
  saveSocialLinks,
  type Department,
  type SocialLink,
} from "@/lib/contact-config";
import { getGallery, saveGallery, type Gallery } from "@/lib/gallery-config";

/** What a save action reports back to its form. */
export type SaveState = { saved: boolean } | null;

async function requireAuth() {
  if (!(await isAuthed())) throw new Error("unauthorized");
}

/** Every public route that renders admin-controlled data. */
function refreshPublic() {
  revalidatePath("/admin", "layout");
  for (const locale of locales) revalidatePath(`/${locale}`, "layout");
}

/* ── auth ─────────────────────────────────────────────────────────────── */

export async function loginAction(_prev: unknown, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    return { error: "كلمة المرور غير صحيحة" };
  }
  await createSession();
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

/* ── rates ────────────────────────────────────────────────────────────── */

/** Saves every rate row submitted from the admin table. */
export async function saveRatesAction(formData: FormData) {
  await requireAuth();

  const codes = formData.getAll("code").map(String);
  for (const code of codes) {
    const buy = parseFloat(String(formData.get(`buy_${code}`) ?? ""));
    const sell = parseFloat(String(formData.get(`sell_${code}`) ?? ""));
    const active = formData.get(`active_${code}`) === "on";
    if (!Number.isFinite(buy) || !Number.isFinite(sell)) continue;

    await prisma.rate.update({ where: { code }, data: { buy, sell, active } });
  }

  refreshPublic();
}

/** Creates the default rate rows the first time the panel is used. */
export async function seedRatesAction() {
  await requireAuth();
  for (const r of DEFAULT_RATES) {
    await prisma.rate.upsert({
      where: { code: r.code },
      update: {},
      create: {
        code: r.code,
        nameAr: r.nameAr,
        nameEn: r.nameEn,
        buy: r.buy,
        sell: r.sell,
        unit: r.unit,
        sort: r.sort,
        active: r.active,
      },
    });
  }
  refreshPublic();
}

/* ── requests ─────────────────────────────────────────────────────────── */

const STATUSES = ["NEW", "IN_PROGRESS", "DONE", "CANCELLED"] as const;
type Status = (typeof STATUSES)[number];

export async function setRequestStatusAction(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !STATUSES.includes(status as Status)) return;

  await prisma.request.update({ where: { id }, data: { status: status as Status } });
  revalidatePath("/admin", "layout");
}

export async function deleteRequestAction(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.request.delete({ where: { id } });
  revalidatePath("/admin", "layout");
}

/** Clears every request already marked done or cancelled. */
export async function clearFinishedRequestsAction() {
  await requireAuth();
  await prisma.request.deleteMany({ where: { status: { in: ["DONE", "CANCELLED"] } } });
  revalidatePath("/admin", "layout");
}

/* ── site content ─────────────────────────────────────────────────────── */

/** Turns a submitted string into the shape the dictionary expects. */
function coerce(raw: FormDataEntryValue | null, field: Field): unknown {
  const text = String(raw ?? "");
  switch (field.type) {
    case "lines":
      return text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    case "num": {
      const n = parseFloat(text);
      return Number.isFinite(n) ? n : 0;
    }
    default:
      // Textareas arrive with CRLF; the site renders "\n" line breaks.
      return text.replace(/\r\n/g, "\n").trim();
  }
}

/**
 * Rebuilds the saved patch for one editor group.
 *
 * List rows carry a key that says where they came from: `r<index>` is an
 * existing row — rebuilt from the current value so fields the editor does not
 * expose (a service `slug`, the map coordinates of a city) survive the save —
 * while `n<n>` is a row the user just added.
 */
export async function saveContentAction(
  _prev: SaveState,
  formData: FormData
): Promise<SaveState> {
  await requireAuth();

  const localeRaw = String(formData.get("locale") ?? "");
  const groupId = String(formData.get("group") ?? "");
  if (!isLocale(localeRaw)) return null;
  const locale: Locale = localeRaw;

  const group = findGroup(groupId);
  if (!group) return null;

  const base = getDict(locale);
  const patch: ContentPatch = structuredClone(await getContentPatch(locale));
  const current = deepMerge(base, patch);

  for (const block of groupBlocks(group)) {
    if (block.kind === "fields") {
      for (const field of block.fields) {
        setPath(patch, field.path, coerce(formData.get(`f:${field.path}`), field));
      }
      continue;
    }

    const order = String(formData.get(`order:${block.path}`) ?? "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const existing = getPath(current, block.path);
    const rows: unknown[] = [];

    for (const key of order) {
      const source =
        key.startsWith("r") && Array.isArray(existing)
          ? existing[Number(key.slice(1))]
          : undefined;
      const row: Record<string, unknown> =
        source && typeof source === "object" ? { ...(source as object) } : {};

      for (const field of block.fields) {
        row[field.path] = coerce(formData.get(`f:${block.path}[${key}].${field.path}`), field);
      }
      rows.push(row);
    }

    setPath(patch, block.path, rows);
  }

  await saveContentPatch(locale, patch);
  refreshPublic();
  return { saved: true };
}

/** Drops every saved edit for one language, restoring the shipped copy. */
export async function resetContentAction(formData: FormData) {
  await requireAuth();
  const locale = String(formData.get("locale") ?? "");
  if (!isLocale(locale)) return;
  await resetContent(locale);
  refreshPublic();
}

/* ── contact details, announcement bar ────────────────────────────────── */

export async function saveSiteAction(formData: FormData) {
  await requireAuth();
  const get = (k: string) => String(formData.get(k) ?? "").trim();

  await saveSiteConfig({
    phone: get("phone"),
    email: get("email"),
    whatsapp: waDigits(get("whatsapp")),
  });
  refreshPublic();
}

export async function saveAnnounceAction(formData: FormData) {
  await requireAuth();
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const tone = get("tone");

  const announce: Announcement = {
    enabled: formData.get("enabled") === "on",
    ar: get("ar"),
    en: get("en"),
    href: get("href"),
    tone: tone === "info" || tone === "alert" ? tone : "gold",
  };
  await saveAnnouncement(announce);
  refreshPublic();
}

/* ── media ────────────────────────────────────────────────────────────── */

export async function uploadMediaAction(formData: FormData) {
  await requireAuth();
  if (!hasDb) return;

  const slot = String(formData.get("slot") ?? "");
  const file = formData.get("file");
  if (!isMediaSlot(slot) || !(file instanceof File) || file.size === 0) return;
  if (file.size > MAX_UPLOAD_BYTES) return;
  if (!ALLOWED_MIME.includes(file.type)) return;

  const data = Buffer.from(await file.arrayBuffer());
  const version = Date.now().toString(36);

  await prisma.media.upsert({
    where: { slot },
    update: { mime: file.type, data, size: data.byteLength, version },
    create: { slot, mime: file.type, data, size: data.byteLength, version },
  });
  refreshPublic();
}

/** Removes an upload so the image shipped with the site takes over again. */
export async function deleteMediaAction(formData: FormData) {
  await requireAuth();
  const slot = String(formData.get("slot") ?? "");
  if (!isMediaSlot(slot)) return;
  await prisma.media.deleteMany({ where: { slot } });
  refreshPublic();
}

/* ── social profiles, department numbers ──────────────────────────────── */

export async function saveSocialAction(formData: FormData) {
  await requireAuth();

  const links: SocialLink[] = [];
  for (const platform of PLATFORMS) {
    const raw = String(formData.get(`url_${platform.id}`) ?? "").trim();
    // Store the sanitised form, so a blocked scheme never reaches the site.
    const url = raw ? safeUrl(raw) : "";
    links.push({ platform: platform.id, url });
  }

  await saveSocialLinks(links);
  refreshPublic();
}

/**
 * Rebuilds the department list from the editor's rows.
 *
 * Row order travels in `order`, the same trick the content editor uses, so
 * adding, reordering and deleting all work from one plain form post.
 */
export async function saveDepartmentsAction(
  _prev: SaveState,
  formData: FormData
): Promise<SaveState> {
  await requireAuth();

  const order = String(formData.get("order") ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const get = (key: string, field: string) =>
    String(formData.get(`dept_${key}_${field}`) ?? "").trim();

  const departments: Department[] = order.map((key) => ({
    icon: get(key, "icon"),
    nameAr: get(key, "nameAr"),
    nameEn: get(key, "nameEn"),
    personAr: get(key, "personAr"),
    personEn: get(key, "personEn"),
    phone: get(key, "phone"),
    whatsapp: digits(get(key, "whatsapp")),
    email: get(key, "email"),
    website: safeUrl(get(key, "website")),
  }));

  await saveDepartments(departments);
  refreshPublic();
  return { saved: true };
}

/* ── the jewellery showroom block ─────────────────────────────────────── */

export async function saveGalleryAction(formData: FormData) {
  await requireAuth();
  const get = (k: string) => String(formData.get(k) ?? "").trim();

  // Start from what is stored so a blank field falls back to the wording
  // already in place rather than emptying the block.
  const current = await getGallery();
  const gallery: Gallery = {
    ...current,
    enabled: formData.get("enabled") === "on",
    nameAr: get("nameAr"),
    nameEn: get("nameEn"),
    taglineAr: get("taglineAr"),
    taglineEn: get("taglineEn"),
    blurbAr: get("blurbAr"),
    blurbEn: get("blurbEn"),
    url: safeUrl(get("url")),
    ctaAr: get("ctaAr"),
    ctaEn: get("ctaEn"),
  };

  await saveGallery(gallery);
  refreshPublic();
}
