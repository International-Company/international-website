import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getDict } from "@/dictionaries";
import GoldMarkets from "@/components/GoldMarkets";
import FAQ from "@/components/FAQ";
import Reveal from "@/components/Reveal";
import ServicesBento from "@/components/ServicesBento";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDict(locale);
  return { title: dict.nav.services };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);

  return (
    <>
      <div className="page-head">
        <div className="wrap">
          <Reveal>
            <div className="chapter-tag">{dict.services.tag}</div>
            <h1 className="section-title">{dict.services.title}</h1>
            <p className="section-sub">{dict.services.sub}</p>
          </Reveal>
        </div>
      </div>

      <ServicesBento dict={dict} locale={locale} showHeader={false} />

      <GoldMarkets dict={dict} />
      <FAQ dict={dict} />
    </>
  );
}
