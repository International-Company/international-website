import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getDict } from "@/dictionaries";
import GoldMarkets from "@/components/GoldMarkets";
import FAQ from "@/components/FAQ";
import Reveal from "@/components/Reveal";

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

      <section style={{ padding: "110px 0", background: "var(--bg)" }}>
        <div className="wrap">
          <div className="svc-cards" style={{ marginTop: 0 }}>
            {dict.services.items.map((s, i) => (
              <Reveal key={s.en} delay={i * 0.1}>
                <div className="svc-card">
                  <span className="num">0{i + 1}</span>
                  <div className="svc-icon">{s.icon}</div>
                  <h3>{s.title}</h3>
                  <span className="en-label">{s.en}</span>
                  <p>{s.desc}</p>
                  <ul className="svc-feats">
                    {s.feats.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <Link href={`/${locale}/contact`} className="text-link">
                    {dict.hero.cta2} <span>{dict.arrow}</span>
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <GoldMarkets dict={dict} />
      <FAQ dict={dict} />
    </>
  );
}
