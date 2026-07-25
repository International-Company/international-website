import type { Dict } from "@/dictionaries";
import Reveal from "./Reveal";

export default function AboutSection({
  dict,
  withTimeline = true,
}: {
  dict: Dict;
  withTimeline?: boolean;
}) {
  return (
    <section className="about" id="about">
      <div className="watermark en" aria-hidden>EST.</div>
      <div className="wrap">
        <div className="about-grid">
          <div>
            <Reveal>
              <div className="chapter-tag">{dict.about.tag}</div>
              <h2 className="section-title">{dict.about.title}</h2>
            </Reveal>
            <Reveal delay={0.1} className="about-story">
              <p>{dict.about.p1}</p>
              <p>
                <strong>{dict.about.visionLabel}</strong> {dict.about.vision}
              </p>
              <p>
                <strong>{dict.about.missionLabel}</strong> {dict.about.mission}
              </p>
            </Reveal>
          </div>
          <div className="values">
            {dict.about.values.map((v, i) => (
              <Reveal key={v.title} delay={0.1 + i * 0.1}>
                <div className="value-card">
                  <div className="icon">{v.icon}</div>
                  <div>
                    <h4>{v.title}</h4>
                    <p>{v.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {withTimeline && (
          <div className="timeline">
            {dict.timeline.items.map((t, i) => (
              <Reveal key={t.year} delay={i * 0.1}>
                <div className="tl-item">
                  <span className="dot" />
                  <span className="year">{t.year}</span>
                  <h4>{t.title}</h4>
                  <p>{t.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
