import { cache } from "react";
import { getSettings, setSetting } from "./settings";
import { safeUrl } from "./contact-config";

/**
 * The jewellery showroom — a site of its own that the contact page links to.
 *
 * It gets its own block rather than riding along as a department's website
 * link, because it is a destination in its own right: its own name, its own
 * emblem, its own few words. The defaults are the showroom's real details, so
 * the block works the moment it is switched on.
 */

export const GALLERY_KEY = "gallery";

export type Gallery = {
  /** Off by default — nothing appears until it is deliberately turned on. */
  enabled: boolean;
  nameAr: string;
  nameEn: string;
  /** A few words under the name: "ذهبٌ خالص • صياغةٌ أصيلة". */
  taglineAr: string;
  taglineEn: string;
  blurbAr: string;
  blurbEn: string;
  url: string;
  /** Wording on the button. */
  ctaAr: string;
  ctaEn: string;
};

export const DEFAULT_GALLERY: Gallery = {
  enabled: false,
  nameAr: "معرض إنترنشونال للمجوهرات",
  nameEn: "International Jewelry Gallery",
  taglineAr: "ذهبٌ خالص · صياغةٌ أصيلة",
  taglineEn: "Pure gold · honest craft",
  blurbAr:
    "مجموعة مختارة تجمع نقاء الذهب وإتقان الصياغة، بأسعار شفافة تُحدَّث يوميًا بالدينار والدولار.",
  blurbEn:
    "A selected collection of pure gold and careful craftsmanship, with transparent prices updated daily in dinar and dollar.",
  url: "https://international-gold.international0.com/",
  ctaAr: "تصفّح المعرض",
  ctaEn: "Browse the gallery",
};

/** Keeps a saved-but-blank field from wiping out the default wording. */
function merge(saved: unknown): Gallery {
  if (typeof saved !== "object" || saved === null) return DEFAULT_GALLERY;
  const row = saved as Record<string, unknown>;
  const out = { ...DEFAULT_GALLERY };

  for (const key of Object.keys(DEFAULT_GALLERY) as (keyof Gallery)[]) {
    const value = row[key];
    if (key === "enabled") {
      out.enabled = value === true;
    } else if (typeof value === "string" && value.trim()) {
      (out[key] as string) = value.trim();
    }
  }

  out.url = safeUrl(out.url);
  // A block with nowhere to go is worse than no block at all.
  if (!out.url) out.enabled = false;
  return out;
}

export const getGallery = cache(async function getGallery(): Promise<Gallery> {
  const saved = await getSettings([GALLERY_KEY]);
  return merge(saved[GALLERY_KEY]);
});

export async function saveGallery(gallery: Gallery) {
  await setSetting(GALLERY_KEY, gallery);
}
