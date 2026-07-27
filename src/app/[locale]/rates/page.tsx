import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getDict } from "@/dictionaries";
import { getCompanyRates } from "@/lib/rates-service";
import Reveal from "@/components/Reveal";
import CompanyRates from "@/components/CompanyRates";

// Always read the latest admin-set rates — never serve a cached table.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDict(locale);
  return { title: dict.rates.title, description: dict.rates.sub };
}

export default async function RatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);
  const { rates, updatedAt, live } = await getCompanyRates();

  return (
    <>
      <div className="page-head">
        <div className="wrap">
          <Reveal>
            <div className="chapter-tag">{dict.rates.tag}</div>
            <h1 className="section-title">{dict.rates.title}</h1>
            <p className="section-sub">{dict.rates.sub}</p>
          </Reveal>
        </div>
      </div>

      <section style={{ padding: "80px 0 100px", background: "var(--bg)" }}>
        <div className="wrap">
          <CompanyRates
            dict={dict}
            locale={locale}
            rates={rates}
            updatedAt={updatedAt}
            live={live}
            withCta
          />
        </div>
      </section>
    </>
  );
}
