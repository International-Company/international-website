"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Dict } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import type { FxRates } from "@/lib/rates";
import Converter from "./Converter";
import Reveal from "./Reveal";

export default function Hero({
  dict,
  locale,
  rates,
}: {
  dict: Dict;
  locale: Locale;
  rates?: FxRates;
}) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, 90]);

  return (
    <section className="hero hero-split" id="hero">
      <div className="wrap hero-grid">
        {/* Copy side */}
        <motion.div className="hero-copy" style={{ y }}>
          <Reveal>
            <div className="hero-badge">
              <span className="pulse-dot" /> {dict.hero.badge}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h1>
              {dict.hero.title}
              <br />
              <span className="thin grad-text">{dict.hero.titleThin}</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="lead">{dict.hero.lead}</p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="hero-ctas">
              <Link href={`/${locale}/services`} className="btn btn-primary magnetic">
                {dict.hero.cta1} <span className="arrow">{dict.arrow}</span>
              </Link>
              <Link href={`/${locale}/contact`} className="btn btn-secondary magnetic">
                {dict.hero.cta2}
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.4}>
            <ul className="trust-row">
              {dict.hero.trust.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </Reveal>
        </motion.div>

        {/* Product side — converter as hero card */}
        <div className="hero-conv">
          <Reveal delay={0.25}>
            <div className="conv-stage">
              <div className="float-chip chip-a" aria-hidden>
                <span>{dict.hero.chips[0].icon}</span> {dict.hero.chips[0].t}
              </div>
              <div className="float-chip chip-b" aria-hidden>
                <span>{dict.hero.chips[1].icon}</span> {dict.hero.chips[1].t}
              </div>
              <Converter dict={dict} rates={rates} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
