import type { Dict } from "@/dictionaries";
import Reveal from "./Reveal";

/** Cinematic full-width money imagery band (home page). */
export default function MoneyBand({ dict }: { dict: Dict }) {
  return (
    <section className="money-band">
      <div className="wrap">
        <Reveal>
          <div className="chapter-tag">{dict.brand.ar} — {dict.brand.en}</div>
          <h2 className="section-title">{dict.showcase.title}</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-sub">{dict.showcase.sub}</p>
        </Reveal>
      </div>
    </section>
  );
}
