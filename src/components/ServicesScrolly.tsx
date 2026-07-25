"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Dict } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";

/** Pinned scrollytelling services section (desktop) + stacked cards (mobile). */
export default function ServicesScrolly({ dict, locale }: { dict: Dict; locale: Locale }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = scrollRef.current;
      if (!el || window.innerWidth <= 980) return;
      const total = el.offsetHeight - window.innerHeight;
      const p = Math.min(Math.max(-el.getBoundingClientRect().top / total, 0), 1);
      setProgress(p);
      setActive(Math.min(3, Math.floor(p * 4)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const jumpTo = (i: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    window.scrollTo({
      top: el.offsetTop + total * (i / 4 + 0.13),
      behavior: "smooth",
    });
  };

  return (
    <>
      <div className="svc-scroll" id="services" ref={scrollRef}>
        <div className="svc-sticky">
          <div className="wrap svc-inner">
            <div className="svc-side">
              <div className="chapter-tag">{dict.services.tag}</div>
              <h2 className="section-title" style={{ fontSize: "clamp(26px,3.4vw,40px)" }}>
                {dict.services.title}
              </h2>
              <ul className="svc-list">
                {dict.services.items.map((s, i) => (
                  <li
                    key={s.en}
                    className={active === i ? "active" : ""}
                    onClick={() => jumpTo(i)}
                  >
                    <span className="n">0{i + 1}</span>
                    <span className="t">{s.title}</span>
                  </li>
                ))}
              </ul>
              <div className="svc-progress">
                <div className="fill" style={{ width: `${progress * 100}%` }} />
              </div>
            </div>

            <div className="svc-view">
              {dict.services.items.map((s, i) => (
                <div key={s.en} className={`svc-panel${active === i ? " active" : ""}`}>
                  <span className="big-num" aria-hidden>0{i + 1}</span>
                  <div className="svc-icon">{s.icon}</div>
                  <h3>{s.title}</h3>
                  <span className="en-label">{s.en}</span>
                  <p>{s.desc}</p>
                  <ul className="svc-feats">
                    {s.feats.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <Link href={`/${locale}/services`} className="text-link">
                    {dict.services.link} <span>{dict.arrow}</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile fallback */}
      <section className="svc-mobile" style={{ padding: "110px 0", background: "var(--bg)" }}>
        <div className="wrap">
          <div className="chapter-tag">{dict.services.tag}</div>
          <h2 className="section-title">{dict.services.title}</h2>
          <div className="svc-cards">
            {dict.services.items.map((s, i) => (
              <div key={s.en} className="svc-card">
                <span className="num">0{i + 1}</span>
                <div className="svc-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <span className="en-label">{s.en}</span>
                <p>{s.desc}</p>
                <Link href={`/${locale}/services`} className="text-link">
                  {dict.services.link} <span>{dict.arrow}</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
