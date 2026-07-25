"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import type { Dict } from "@/dictionaries";
import Reveal from "./Reveal";

function Counter({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const dur = 1600;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - t0) / dur, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);

  return <span ref={ref}>{value}</span>;
}

export default function Stats({ dict }: { dict: Dict }) {
  return (
    <section className="stats">
      <div className="wrap">
        <div className="stats-grid">
          {dict.stats.items.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1} className="stat">
              <div className="num">
                <Counter target={s.value} />
                {s.suffix && <span className="plus">{s.suffix}</span>}
              </div>
              <div className="label">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
