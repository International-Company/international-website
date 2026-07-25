import type { Dict } from "@/dictionaries";
import Reveal from "./Reveal";

/** Demo gold prices — wire to a live gold API in production. */
const SPARKS = [
  "0,26 12,24 22,27 34,20 46,22 58,15 70,17 82,10 100,6",
  "0,28 14,25 26,26 38,21 50,23 62,16 76,18 88,12 100,9",
  "0,27 14,26 28,23 40,24 52,18 64,20 78,14 90,15 100,10",
  "0,18 14,20 28,16 40,22 52,19 64,24 78,21 90,25 100,23",
];

export default function GoldMarkets({ dict }: { dict: Dict }) {
  const cards = [
    { k: dict.markets.ounce, karat: "XAU / USD", karatEn: true, price: "$2,412.30", unit: dict.markets.perOunce, chg: "0.64%", up: true },
    { k: dict.markets.gram, karat: dict.markets.karat24, karatEn: false, price: "$86.40", unit: dict.markets.perGram, chg: "0.58%", up: true },
    { k: dict.markets.gram, karat: dict.markets.karat21, karatEn: false, price: "$75.60", unit: dict.markets.perGram, chg: "0.52%", up: true },
    { k: dict.markets.gram, karat: dict.markets.karat18, karatEn: false, price: "$64.80", unit: dict.markets.perGram, chg: "0.12%", up: false },
  ];

  return (
    <section className="markets" id="markets">
      <div className="wrap">
        <Reveal>
          <div className="chapter-tag">{dict.markets.tag}</div>
          <h2 className="section-title">{dict.markets.title}</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-sub">{dict.markets.sub}</p>
        </Reveal>

        <div className="gold-grid">
          {cards.map((c, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="gold-card">
                <div className="k">{c.k}</div>
                <div className={`karat${c.karatEn ? " en" : ""}`}>{c.karat}</div>
                <div className="price">{c.price}</div>
                <div className="unit">{c.unit}</div>
                <div>
                  <span className={`chg ${c.up ? "up" : "dn"}`}>
                    {c.up ? "▲" : "▼"} {c.chg}
                  </span>
                </div>
                <svg className="spark" viewBox="0 0 100 34" preserveAspectRatio="none">
                  <polyline points={SPARKS[i]} />
                </svg>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
