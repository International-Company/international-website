import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { dirOf, isLocale, locales, type Locale } from "@/lib/i18n";
import "../../globals.css";
import "./card.css";

/**
 * The QR landing page's own shell.
 *
 * It deliberately does not reuse the site layout: no navbar, no ticker, no
 * link into the rest of the site. Someone who scans the code at the counter
 * gets the contact card and nothing to wander off into.
 */

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

export const viewport: Viewport = { themeColor: "#0a0a0a" };

export const metadata: Metadata = {
  // The same details as the contact page — that one should be the one indexed.
  robots: { index: false, follow: false },
};

const themeInit = `(function(){try{var t=localStorage.getItem('intl-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default async function CardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;

  return (
    <html
      lang={locale}
      dir={dirOf(locale)}
      suppressHydrationWarning
      className={`${plexArabic.variable} ${inter.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body
        className="card-body"
        style={{
          fontFamily:
            locale === "ar"
              ? "var(--font-ar), sans-serif"
              : "var(--font-en), var(--font-ar), sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
