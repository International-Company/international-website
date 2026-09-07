import { headers } from "next/headers";
import QRCode from "qrcode";
import { getSiteConfig } from "./site-config";
import { locales, type Locale } from "./i18n";

/**
 * QR codes for the printed contact card.
 *
 * The code points at `/card/<locale>`, a page with no way back into the site,
 * so a code stuck to a counter or printed on a receipt opens the numbers and
 * nothing else.
 */

/** Error correction M survives a scuff or a logo overlay on a printed sticker. */
const OPTIONS = {
  errorCorrectionLevel: "M" as const,
  margin: 2,
  color: { dark: "#0a0a0a", light: "#ffffff" },
};

export const cardPath = (locale: Locale) => `/card/${locale}`;

/**
 * The origin a printed code should point at.
 *
 * Prefers the host the panel is actually being served from, because that one
 * is provably reachable — the admin is looking at it. `NEXT_PUBLIC_SITE_URL`
 * is only a declaration, and a code printed against a domain that does not
 * resolve yet is a code that has to be reprinted.
 */
export async function cardOrigin(): Promise<string> {
  const head = await headers();
  const host = head.get("x-forwarded-host") ?? head.get("host");
  if (host) {
    const proto = head.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }
  const { siteUrl } = await getSiteConfig();
  return siteUrl;
}

/** The absolute URL a scanner will open. */
export async function cardUrl(locale: Locale): Promise<string> {
  return new URL(cardPath(locale), await cardOrigin()).toString();
}

/**
 * The canonical URL as configured, when it differs from where the panel is
 * being served — the panel warns about the mismatch rather than silently
 * choosing one.
 */
export async function configuredOrigin(): Promise<string | null> {
  const { siteUrl } = await getSiteConfig();
  const current = await cardOrigin();
  try {
    return new URL(siteUrl).origin === new URL(current).origin
      ? null
      : new URL(siteUrl).origin;
  } catch {
    return null;
  }
}

/** Inline SVG — sharp at any print size, and no extra request from the panel. */
export async function cardQrSvg(locale: Locale): Promise<string> {
  return QRCode.toString(await cardUrl(locale), { ...OPTIONS, type: "svg", width: 320 });
}

/** PNG bytes for download, at a size that prints cleanly. */
export async function cardQrPng(locale: Locale, width = 1024): Promise<Buffer> {
  return QRCode.toBuffer(await cardUrl(locale), { ...OPTIONS, type: "png", width });
}

/** Every locale's card, for the panel to list. */
export async function allCards(): Promise<
  { locale: Locale; url: string; svg: string }[]
> {
  return Promise.all(
    locales.map(async (locale) => ({
      locale,
      url: await cardUrl(locale),
      svg: await cardQrSvg(locale),
    }))
  );
}
