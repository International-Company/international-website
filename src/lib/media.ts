import { cache } from "react";
import { prisma, safeDb, hasDb } from "./db";

export { MAX_UPLOAD_BYTES, ALLOWED_MIME } from "./media-constants";

/**
 * Images the admin panel can replace.
 *
 * Each slot has a file shipped in `public/images` as its default. Uploading
 * from the panel stores the bytes in the database and the site starts serving
 * `/api/media/<slot>` instead, so uploads survive a redeploy on hosts with an
 * ephemeral filesystem. Deleting an upload restores the shipped file.
 */

export type MediaSlot = {
  slot: string;
  label: string;
  /** File served when nothing has been uploaded. */
  fallback: string;
  hint: string;
  /** Roughly how the image is displayed, used to size the preview box. */
  shape: "wide" | "tall" | "square";
};

export const MEDIA_SLOTS: MediaSlot[] = [
  {
    slot: "logo",
    label: "شعار الشركة",
    fallback: "/images/logo.png",
    hint: "يظهر في القائمة العلوية والتذييل وشاشة البداية — يفضّل PNG بخلفية شفافة",
    shape: "square",
  },
  {
    slot: "hero",
    label: "خلفية الواجهة الرئيسية",
    fallback: "/images/hero-city.jpg",
    hint: "الصورة العريضة خلف اسم الشركة في أعلى الصفحة",
    shape: "wide",
  },
  {
    slot: "money-hero",
    label: "صورة المشاركة الاجتماعية",
    fallback: "/images/money-hero.jpg",
    hint: "تظهر عند مشاركة رابط الموقع على واتساب وفيسبوك — يفضّل 1600×1066",
    shape: "wide",
  },
  {
    slot: "showcase-city",
    label: "صورة قسم العرض",
    fallback: "/images/showcase-city.jpg",
    hint: "الصورة الكبيرة في قسم «لماذا إنترنشونال»",
    shape: "wide",
  },
  {
    slot: "showcase-towers",
    label: "صورة العرض الجانبية",
    fallback: "/images/showcase-towers.jpg",
    hint: "الصورة الطولية بجانب نص قسم العرض",
    shape: "tall",
  },
  {
    slot: "svc-exchange",
    label: "صورة خدمة الصرافة",
    fallback: "/images/svc-exchange.jpg",
    hint: "بطاقة صرافة العملات وصفحة الخدمة",
    shape: "wide",
  },
  {
    slot: "svc-transfer",
    label: "صورة خدمة التحويلات",
    fallback: "/images/svc-transfer.jpg",
    hint: "بطاقة التحويلات الدولية وصفحة الخدمة",
    shape: "wide",
  },
  {
    slot: "svc-remit",
    label: "صورة خدمة الحوالات",
    fallback: "/images/svc-remit.jpg",
    hint: "بطاقة الحوالات المالية وصفحة الخدمة",
    shape: "wide",
  },
  {
    slot: "svc-gold",
    label: "صورة خدمة الذهب",
    fallback: "/images/svc-gold.jpg",
    hint: "بطاقة الذهب والمجوهرات وصفحة الخدمة",
    shape: "wide",
  },
];

const SLOT_IDS = new Set(MEDIA_SLOTS.map((s) => s.slot));

export const isMediaSlot = (slot: string) => SLOT_IDS.has(slot);

/** Maps every slot to the URL the site should use right now. */
export type ImageMap = Record<string, string>;

/** Default map — every slot pointing at its shipped file. */
export function defaultImages(): ImageMap {
  const out: ImageMap = {};
  for (const s of MEDIA_SLOTS) out[s.slot] = s.fallback;
  return out;
}

/**
 * URLs for every image slot, preferring uploads. Cached per request so a page
 * rendering several images only hits the database once.
 */
export const getImages = cache(async function getImages(): Promise<ImageMap> {
  const images = defaultImages();
  if (!hasDb) return images;

  const rows = await safeDb(
    () => prisma.media.findMany({ select: { slot: true, version: true } }),
    [] as { slot: string; version: string }[]
  );

  for (const row of rows) {
    if (isMediaSlot(row.slot)) {
      images[row.slot] = `/api/media/${row.slot}?v=${row.version}`;
    }
  }
  return images;
});

/** Upload metadata for the admin panel — never loads the image bytes. */
export async function listMedia() {
  return safeDb(
    () =>
      prisma.media.findMany({
        select: { slot: true, mime: true, size: true, version: true, updatedAt: true },
      }),
    [] as { slot: string; mime: string; size: number; version: string; updatedAt: Date }[]
  );
}
