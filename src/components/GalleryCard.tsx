import Image from "next/image";
import type { Locale } from "@/lib/i18n";
import type { Gallery } from "@/lib/gallery-config";

/**
 * The jewellery showroom, on the contact page.
 *
 * It is a separate business with its own emblem and its own site, so it gets
 * its own gold-toned block rather than sitting in the blue grid of department
 * cards — the colour shift is what tells the visitor they are being handed
 * off somewhere else.
 */
export default function GalleryCard({
  locale,
  gallery,
  emblem,
}: {
  locale: Locale;
  gallery: Gallery;
  /** Slot URL, so the emblem can be replaced from the panel. */
  emblem: string;
}) {
  if (!gallery.enabled) return null;

  const ar = locale === "ar";
  const name = (ar ? gallery.nameAr : gallery.nameEn) || gallery.nameAr;
  const tagline = (ar ? gallery.taglineAr : gallery.taglineEn) || gallery.taglineAr;
  const blurb = (ar ? gallery.blurbAr : gallery.blurbEn) || gallery.blurbAr;
  const cta = (ar ? gallery.ctaAr : gallery.ctaEn) || gallery.ctaAr;

  return (
    <a
      className="gallery-card"
      href={gallery.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="gc-emblem">
        <Image
          src={emblem}
          alt=""
          width={132}
          height={132}
          unoptimized={emblem.startsWith("/api/")}
        />
      </span>

      <span className="gc-body">
        <strong className="gc-name">{name}</strong>
        {tagline && <span className="gc-tagline">{tagline}</span>}
        {blurb && <span className="gc-blurb">{blurb}</span>}
        <span className="gc-cta">
          {cta}
          <span aria-hidden>↗</span>
        </span>
      </span>
    </a>
  );
}
