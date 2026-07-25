import Link from "next/link";
import type { Dict } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import Reveal from "./Reveal";

/**
 * Bento-grid services section.
 * Featured (tall, blue gradient): Money Remittances — the company's core.
 * Wide bottom card: Gold & Jewelry. Two compact cards: transfers + exchange.
 */
export default function ServicesBento({
  dict,
  locale,
  showHeader = true,
  linkHref,
  linkLabel,
}: {
  dict: Dict;
  locale: Locale;
  showHeader?: boolean;
  linkHref?: string;
  linkLabel?: string;
}) {
  const s = dict.services.items;
  const feat = s[2]; // الحوالات المالية
  const a = s[1]; // التحويلات الدولية
  const b = s[0]; // صرافة العملات
  const gold = s[3]; // الذهب والمجوهرات

  const href = linkHref ?? `/${locale}/services`;
  const label = linkLabel ?? dict.services.link;

  return (
    <section className="services-bento" id="services">
      <div className="wrap">
        {showHeader && (
          <>
            <Reveal>
              <div className="chapter-tag">{dict.services.tag}</div>
              <h2 className="section-title">{dict.services.title}</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="section-sub">{dict.services.sub}</p>
            </Reveal>
          </>
        )}

        <div className="bento-grid" style={showHeader ? undefined : { marginTop: 0 }}>
          {/* Featured — remittances */}
          <Reveal className="g-feat">
            <div className="bento-card bento-feat">
              <span className="bento-num">01</span>
              <span className="bento-ghost" aria-hidden>01</span>
              <div className="bento-icon">{feat.icon}</div>
              <h3>{feat.title}</h3>
              <span className="en-label">{feat.en}</span>
              <p>{feat.desc}</p>
              <ul className="svc-feats">
                {feat.feats.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <Link href={href} className="text-link">
                {label} <span>{dict.arrow}</span>
              </Link>
            </div>
          </Reveal>

          {/* International transfers */}
          <Reveal className="g-a" delay={0.1}>
            <div className="bento-card">
              <span className="bento-num">02</span>
              <span className="bento-ghost" aria-hidden>02</span>
              <div className="bento-icon">{a.icon}</div>
              <h3>{a.title}</h3>
              <span className="en-label">{a.en}</span>
              <p>{a.desc}</p>
              <Link href={href} className="text-link">
                {label} <span>{dict.arrow}</span>
              </Link>
            </div>
          </Reveal>

          {/* Currency exchange */}
          <Reveal className="g-b" delay={0.2}>
            <div className="bento-card">
              <span className="bento-num">03</span>
              <span className="bento-ghost" aria-hidden>03</span>
              <div className="bento-icon">{b.icon}</div>
              <h3>{b.title}</h3>
              <span className="en-label">{b.en}</span>
              <p>{b.desc}</p>
              <Link href={href} className="text-link">
                {label} <span>{dict.arrow}</span>
              </Link>
            </div>
          </Reveal>

          {/* Gold & jewelry — wide */}
          <Reveal className="g-gold" delay={0.3}>
            <div className="bento-card bento-gold">
              <span className="bento-num">04</span>
              <span className="bento-ghost" aria-hidden>◈</span>
              <div className="bento-icon">{gold.icon}</div>
              <div className="bento-body">
                <h3>{gold.title}</h3>
                <span className="en-label">{gold.en}</span>
                <p>{gold.desc}</p>
                <Link href={href} className="text-link">
                  {label} <span>{dict.arrow}</span>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
