import type { Dict } from "@/dictionaries";
import Reveal from "./Reveal";

export default function Branches({ dict }: { dict: Dict }) {
  return (
    <section className="branches" id="branches">
      <div className="wrap">
        <Reveal>
          <div className="chapter-tag">{dict.branches.tag}</div>
          <h2 className="section-title">{dict.branches.title}</h2>
        </Reveal>
        <div className="branches-grid">
          {dict.branches.items.map((b, i) => (
            <Reveal key={b.name} delay={i * 0.1}>
              <div className="branch-card">
                <span className="b-tag">{b.tag}</span>
                <h4>{b.name}</h4>
                <div className="b-line"><span className="ic">⌖</span><span>{dict.branches.address}</span></div>
                <div className="b-line"><span className="ic">✆</span><span className="en">{dict.branches.phone}</span></div>
                <div className="b-line"><span className="ic">◷</span><span>{dict.branches.hours}</span></div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
