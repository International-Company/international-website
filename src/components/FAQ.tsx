"use client";

import { useState } from "react";
import type { Dict } from "@/dictionaries";
import Reveal from "./Reveal";

export default function FAQ({ dict }: { dict: Dict }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="faq">
      <div className="wrap">
        <div style={{ textAlign: "center" }}>
          <Reveal>
            <div className="chapter-tag center">{dict.faq.tag}</div>
            <h2 className="section-title">{dict.faq.title}</h2>
          </Reveal>
        </div>
        <div className="faq-list">
          {dict.faq.items.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.08}>
              <div className={`faq-item${open === i ? " open" : ""}`}>
                <button
                  className="faq-q"
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                >
                  {f.q} <span className="sign">+</span>
                </button>
                <div
                  className="faq-a"
                  style={{ maxHeight: open === i ? "200px" : "0" }}
                >
                  <p>{f.a}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
