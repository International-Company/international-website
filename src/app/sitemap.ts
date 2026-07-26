import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { locales } from "@/lib/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "",
    "/about",
    "/services",
    "/services/exchange",
    "/services/transfers",
    "/services/remittances",
    "/services/gold",
    "/contact",
    "/legal",
  ];
  return pages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: page === "" ? ("daily" as const) : ("monthly" as const),
      priority: page === "" ? 1 : 0.7,
    }))
  );
}
