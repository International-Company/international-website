import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { dirOf, isLocale, locales, type Locale } from "@/lib/i18n";
import { getDict } from "@/dictionaries";
import Preloader from "@/components/Preloader";
import ScrollProgress from "@/components/ScrollProgress";
import CursorFx from "@/components/CursorFx";
import Ticker from "@/components/Ticker";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDict(locale);
  return {
    title: {
      default: dict.meta.title,
      template: `%s — ${dict.brand.en}`,
    },
    description: dict.meta.description,
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
  const dict = getDict(locale);
  const dir = dirOf(locale);

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${plexArabic.variable} ${inter.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body
        style={{
          fontFamily:
            locale === "ar"
              ? "var(--font-ar), sans-serif"
              : "var(--font-en), var(--font-ar), sans-serif",
        }}
      >
        <Preloader brandEn={dict.brand.en} brandAr={dict.brand.ar} />
        <div className="grain" aria-hidden />
        <ScrollProgress />
        <CursorFx />
        <Ticker />
        <Navbar dict={dict} locale={locale} />
        <main>{children}</main>
        <Footer dict={dict} locale={locale} />
        <WhatsAppFloat label={dict.whatsapp} />
      </body>
    </html>
  );
}
