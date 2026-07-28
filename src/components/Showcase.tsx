import Image from "next/image";
import Link from "next/link";
import type { Dict } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import Reveal from "./Reveal";

/**
 * Centrepiece section: a large framed skyline image with floating glass
 * cards, paired with the "why us" pillars.
 */
export default function Showcase({ dict, locale }: { dict: Dict; locale: Locale }) {
  const s = dict.showcase;

  return (
    <section className="showcase">
      <div className="wrap">
        <div className="sc-grid">
          {/* image side */}
          <Reveal className="sc-visual">
            <div className="sc-frame">
              <Image
                src="/images/showcase-city.jpg"
                alt=""
                fill
                sizes="(max-width: 980px) 100vw, 52vw"
                className="sc-img"
              />
              <div className="sc-veil" />

              <div className="sc-badge">
                <span className="pulse-dot" /> {s.badge}
              </div>

              <div className="sc-float sc-float-a">
                <span className="ic">🌍</span>
                <div>
                  <b>120+</b>
                  <small>{locale === "ar" ? "دولة نصل إليها" : "countries reached"}</small>
                </div>
              </div>

              <div className="sc-float sc-float-b">
                <span className="ic">⚡</span>
                <div>
                  <b>{locale === "ar" ? "دقائق" : "Minutes"}</b>
                  <small>{locale === "ar" ? "زمن وصول الحوالة" : "typical delivery time"}</small>
                </div>
              </div>
            </div>
          </Reveal>

          {/* copy side */}
          <div className="sc-copy">
            <Reveal>
              <div className="chapter-tag">{s.tag}</div>
              <h2 className="section-title">{s.heading}</h2>
              <p className="section-sub">{s.body}</p>
            </Reveal>

            <ul className="sc-points">
              {s.points.map((p, i) => (
                <Reveal key={p.t} delay={0.1 + i * 0.1}>
                  <li>
                    <span className="ic">{p.icon}</span>
                    <div>
                      <b>{p.t}</b>
                      <span>{p.d}</span>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={0.4}>
              <Link href={`/${locale}/about`} className="btn btn-secondary magnetic sc-cta">
                {s.cta} <span className="arrow">{dict.arrow}</span>
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
