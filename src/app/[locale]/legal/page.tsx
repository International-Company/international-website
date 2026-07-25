import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getDict } from "@/dictionaries";
import Reveal from "@/components/Reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDict(locale);
  return { title: dict.legal.title };
}

export default async function LegalPage({
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
            <div className="chapter-tag">{dict.legal.title}</div>
            <h1 className="section-title">{dict.legal.heading}</h1>
            <p className="section-sub">{dict.legal.updated}</p>
          </Reveal>
        </div>
      </div>

      <section style={{ padding: "90px 0", background: "var(--bg)" }}>
        <div className="wrap" style={{ maxWidth: 860 }}>
          <Reveal>
            <h2 style={{ fontSize: 26, marginBottom: 28 }}>{dict.legal.privacyTitle}</h2>
          </Reveal>
          {dict.legal.privacy.map((item, i) => (
            <Reveal key={item.h} delay={i * 0.05}>
              <div className="legal-item">
                <h3>{item.h}</h3>
                <p>{item.p}</p>
              </div>
            </Reveal>
          ))}

          <Reveal>
            <h2 style={{ fontSize: 26, margin: "56px 0 28px" }}>{dict.legal.termsTitle}</h2>
          </Reveal>
          {dict.legal.terms.map((item, i) => (
            <Reveal key={item.h} delay={i * 0.05}>
              <div className="legal-item">
                <h3>{item.h}</h3>
                <p>{item.p}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
