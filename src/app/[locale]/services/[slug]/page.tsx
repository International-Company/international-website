import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getDict } from "@/dictionaries";
import { WHATSAPP_NUMBER } from "@/lib/site";
import Reveal from "@/components/Reveal";

const SLUG_IMAGES: Record<string, string> = {
  exchange: "/images/svc-exchange.jpg",
  transfers: "/images/svc-transfer.jpg",
  remittances: "/images/svc-remit.jpg",
  gold: "/images/svc-gold.jpg",
};

const SLUG_HUES: Record<string, string> = {
  exchange: "hue-violet",
  transfers: "hue-teal",
  remittances: "",
  gold: "hue-gold-page",
};

export function generateStaticParams() {
  return Object.keys(SLUG_IMAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDict(locale);
  const svc = dict.services.items.find((s) => s.slug === slug);
  if (!svc) return {};
  return { title: svc.title, description: svc.desc };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);
  const svc = dict.services.items.find((s) => s.slug === slug);
  if (!svc) notFound();

  const d = dict.services.detail;
  const waText = d.waText.replace("{service}", svc.title);
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;

  return (
    <>
      <div className="page-head">
        <div className="wrap">
          <Reveal>
            <div className="chapter-tag">
              {svc.icon} {dict.services.tag}
            </div>
            <h1 className="section-title">{svc.title}</h1>
            <p className="section-sub">{svc.desc}</p>
          </Reveal>
        </div>
      </div>

      {/* Hero image + about */}
      <section style={{ padding: "90px 0 0", background: "var(--bg)" }}>
        <div className="wrap">
          <Reveal>
            <div className="svc-detail-img">
              <Image
                src={SLUG_IMAGES[slug]}
                alt={svc.title}
                fill
                priority
                sizes="(max-width: 980px) 100vw, 1180px"
              />
            </div>
          </Reveal>

          <div className="svc-detail-grid">
            <Reveal>
              <div>
                <div className="chapter-tag">{d.aboutTitle}</div>
                <div className="about-story">
                  {svc.long.map((p) => (
                    <p key={p.slice(0, 24)}>{p}</p>
                  ))}
                </div>
                <ul className="svc-feats" style={{ marginTop: 8 }}>
                  {svc.feats.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* Why trust us */}
            <div className="values">
              {d.why.map((w, i) => (
                <Reveal key={w.t} delay={0.1 + i * 0.1}>
                  <div className="value-card">
                    <div className="icon">{w.icon}</div>
                    <div>
                      <h4>{w.t}</h4>
                      <p>{w.d}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section style={{ padding: "90px 0", background: "var(--bg)" }}>
        <div className="wrap">
          <Reveal>
            <div className="chapter-tag">{d.stepsTitle}</div>
          </Reveal>
          <div className="steps-grid">
            {svc.steps.map((s, i) => (
              <Reveal key={s.t} delay={i * 0.12}>
                <div className={`step-card ${SLUG_HUES[slug]}`}>
                  <span className="step-num">{i + 1}</span>
                  <h4>{s.t}</h4>
                  <p>{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section style={{ padding: "0 0 110px", background: "var(--bg)" }}>
        <div className="wrap">
          <Reveal>
            <div className="cta-band">
              <h2>{d.ctaTitle}</h2>
              <p>{d.ctaSub}</p>
              <div className="cta-actions">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary magnetic"
                >
                  ✆ {d.ctaWhats}
                </a>
                <Link href={`/${locale}/contact`} className="btn btn-secondary magnetic">
                  {d.ctaContact} <span className="arrow">{dict.arrow}</span>
                </Link>
              </div>
              <Link href={`/${locale}/services`} className="text-link cta-back">
                {d.back} <span>{dict.arrow}</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
