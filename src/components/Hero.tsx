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
  const y = useTransform(scrollY, [0, 800], [0, 120]);

  return (
    <section className="hero" id="hero">
      <motion.div className="hero-content" style={{ y }}>
        <Reveal>
          <div className="hero-badge">
            <span className="pulse-dot" /> {dict.hero.badge}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <span className="en-word">{dict.hero.kicker}</span>
          <h1>
            {dict.hero.title}
            <br />
            <span className="thin">{dict.hero.titleThin}</span>
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
          <Converter dict={dict} rates={rates} />
        </Reveal>
      </motion.div>
    </section>
  );
}
