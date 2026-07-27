import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getDict } from "@/dictionaries";
import { getCompanyRates } from "@/lib/rates-service";
import Reveal from "@/components/Reveal";

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

  const currencies = rates.filter((r) => r.unit === "currency");
  const gold = rates.filter((r) => r.unit === "gold");
  const nameOf = (r: (typeof rates)[number]) => (locale === "ar" ? r.nameAr : r.nameEn);
  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 3 });

  const Table = ({
    title,
    unit,
    rows,
  }: {
    title: string;
    unit: string;
    rows: typeof rates;
  }) => (
    <Reveal>
      <div className="rt-card">
        <div className="rt-head">
          <h2>{title}</h2>
          <span>{unit}</span>
        </div>
        <div className="rt-row rt-labels">
          <span />
          <span>{dict.rates.buy}</span>
          <span>{dict.rates.sell}</span>
        </div>
        {rows.map((r) => (
          <div className="rt-row" key={r.code}>
            <span className="rt-name">
              <b>{nameOf(r)}</b>
              <small>{r.code}</small>
            </span>
            <span className="rt-val buy">{fmt(r.buy)}</span>
            <span className="rt-val sell">{fmt(r.sell)}</span>
          </div>
        ))}
      </div>
    </Reveal>
  );

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
          <Reveal>
            <div className="rt-meta">
              {live && updatedAt ? (
                <>
                  <span className="pulse-dot" />
                  {dict.rates.updated}:{" "}
                  {new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(updatedAt)}
                </>
              ) : (
                dict.rates.notLive
              )}
            </div>
          </Reveal>

          <div className="rt-grid">
            {currencies.length > 0 && (
              <Table
                title={dict.rates.currencies}
                unit={dict.rates.unitCurrency}
                rows={currencies}
              />
            )}
            {gold.length > 0 && (
              <Table title={dict.rates.gold} unit={dict.rates.unitGold} rows={gold} />
            )}
          </div>

          <Reveal delay={0.15}>
            <div style={{ textAlign: "center", marginTop: 44 }}>
              <Link href={`/${locale}/request`} className="btn btn-primary magnetic">
                {dict.rates.cta} <span className="arrow">{dict.arrow}</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
