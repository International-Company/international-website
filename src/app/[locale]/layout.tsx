import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { dirOf, isLocale, locales, type Locale } from "@/lib/i18n";
import { getContent } from "@/lib/content";
import { SITE_URL } from "@/lib/site";
import { getSiteConfig } from "@/lib/site-config";
import { getImages } from "@/lib/media";
import AnnounceBar from "@/components/AnnounceBar";
import Preloader from "@/components/Preloader";
import ScrollProgress from "@/components/ScrollProgress";
import CursorFx from "@/components/CursorFx";
import Ticker from "@/components/Ticker";
import Navbar from "@/components/Navbar";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Analytics from "@/components/Analytics";
import "../globals.css";

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ar",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-en",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getContent(locale);
  const images = await getImages();
  const share = images["money-hero"];
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: dict.meta.title,
      template: `%s — ${dict.brand.en}`,
    },
    description: dict.meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: { ar: "/ar", en: "/en" },
    },
    openGraph: {
      type: "website",
      locale: locale === "ar" ? "ar_AR" : "en_US",
      url: `/${locale}`,
      siteName: `${dict.brand.en} — ${dict.brand.ar}`,
      title: dict.meta.title,
      description: dict.meta.description,
      images: [{ url: share, width: 1600, height: 1066 }],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
      images: [share],
    },
  };
}

const themeInit = `(function(){try{var t=localStorage.getItem('intl-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = await getContent(locale);
  const dir = dirOf(locale);
  const images = await getImages();
  const site = await getSiteConfig();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name: locale === "ar" ? dict.brand.ar : dict.brand.en,
    alternateName: "International Financial Company",
    description: dict.meta.description,
    url: `${SITE_URL}/${locale}`,
    email: site.email,
    telephone: site.phone,
    logo: `${SITE_URL}${images.logo}`,
    image: `${SITE_URL}${images["money-hero"]}`,
    address: {
      "@type": "PostalAddress",
      streetAddress:
        locale === "ar"
          ? "البلد - مقابل البلدية"
          : "Downtown, opposite the Municipality",
      addressLocality: locale === "ar" ? "دير البلح" : "Deir al-Balah",
      addressCountry: "PS",
    },
    openingHours: "Sa-Th 09:00-21:00",
    priceRange: "$$",
  };

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${plexArabic.variable} ${inter.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        style={{
          fontFamily:
            locale === "ar"
              ? "var(--font-ar), sans-serif"
              : "var(--font-en), var(--font-ar), sans-serif",
        }}
      >
        <Preloader
          title={dict.preloader.title}
          tagline={dict.preloader.tagline}
          logo={images.logo}
        />
        <div className="grain" aria-hidden />
        <ScrollProgress />
        <CursorFx />
        <AnnounceBar locale={locale} />
        <Ticker />
        <Navbar dict={dict} locale={locale} logo={images.logo} />
        <main>{children}</main>
        <WhatsAppFloat label={dict.whatsapp} wa={site.whatsapp} />
        <Analytics />
      </body>
    </html>
  );
}
