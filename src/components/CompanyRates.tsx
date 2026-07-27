import Link from "next/link";
import type { Dict } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import type { CompanyRate } from "@/lib/rates-data";
import Reveal from "./Reveal";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 3 });

function Table({
  title,
  unit,
  rows,
  dict,
  locale,
}: {
  title: string;
  unit: string;
  rows: CompanyRate[];
  dict: Dict;
  locale: Locale;
}) {
  return (
    <Reveal>
      <div className="rt-card">
        <div className="rt-head">
          <h3>{title}</h3>
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
              <b>{locale === "ar" ? r.nameAr : r.nameEn}</b>
              <small>{r.code}</small>
            </span>
            <span className="rt-val buy">{fmt(r.buy)}</span>
            <span className="rt-val sell">{fmt(r.sell)}</span>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

/** Company buy/sell rate tables — shared by the home page and /rates. */
export default function CompanyRates({
  dict,
  locale,
  rates,
  updatedAt,
  live,
  withHeader = false,
  withCta = false,
}: {
  dict: Dict;
  locale: Locale;
  rates: CompanyRate[];
  updatedAt: Date | null;
  live: boolean;
  withHeader?: boolean;
  withCta?: boolean;
}) {
  const currencies = rates.filter((r) => r.unit === "currency");
  const gold = rates.filter((r) => r.unit === "gold");

  return (
    <>
      {withHeader && (
        <Reveal>
          <div className="chapter-tag">{dict.rates.tag}</div>
          <h2 className="section-title">{dict.rates.title}</h2>
          <p className="section-sub">{dict.rates.sub}</p>
        </Reveal>
      )}

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
            dict={dict}
            locale={locale}
          />
        )}
        {gold.length > 0 && (
          <Table
            title={dict.rates.gold}
            unit={dict.rates.unitGold}
            rows={gold}
            dict={dict}
            locale={locale}
          />
        )}
      </div>

      {withCta && (
        <Reveal delay={0.15}>
          <div style={{ textAlign: "center", marginTop: 44 }}>
            <Link href={`/${locale}/request`} className="btn btn-primary magnetic">
              {dict.rates.cta} <span className="arrow">{dict.arrow}</span>
            </Link>
          </div>
        </Reveal>
      )}
    </>
  );
}
