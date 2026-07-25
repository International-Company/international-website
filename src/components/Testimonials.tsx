"use client";

import { useEffect, useState } from "react";
import type { Dict } from "@/dictionaries";
import Reveal from "./Reveal";

export default function Testimonials({ dict }: { dict: Dict }) {
  const [idx, setIdx] = useState(0);
  const count = dict.testimonials.items.length;

  useEffect(() => {
    const timer = setInterval(() => setIdx((i) => (i + 1) % count), 5500);
    return () => clearInterval(timer);
  }, [count, idx]);

  return (
    <section className="testimonials" id="testimonials">
      <div className="wrap">
        <Reveal>
          <div className="chapter-tag center">{dict.testimonials.tag}</div>
          <h2 className="section-title">{dict.testimonials.title}</h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="testimonial-box">
            {dict.testimonials.items.map((t, i) => (
              <div key={t.who} className={`t-slide${idx === i ? " active" : ""}`}>
                <div className="quote-mark">&ldquo;</div>
                <blockquote>{t.quote}</blockquote>
                <div className="who">{t.who}</div>
                <div className="role">{t.role}</div>
              </div>
            ))}
          </div>
          <div className="t-dots">
            {dict.testimonials.items.map((t, i) => (
              <button
                key={t.who}
                className={idx === i ? "active" : ""}
                onClick={() => setIdx(i)}
                aria-label={`${i + 1}`}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
