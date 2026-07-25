import type { Dict } from "@/dictionaries";
import { getMetalPrice } from "@/lib/rates";
import Reveal from "./Reveal";

const GRAMS_PER_OUNCE = 31.1034768;

const usd = (n: number, digits = 2) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export default async function GoldMarkets({ dict }: { dict: Dict }) {
  const gold = await getMetalPrice("XAU");
  const gram24 = gold.price / GRAMS_PER_OUNCE;

  const cards = [
    { k: dict.markets.ounce, karat: "XAU / USD", karatEn: true, price: usd(gold.price, 0), unit: dict.markets.perOunce },
    { k: dict.markets.gram, karat: dict.markets.karat24, karatEn: false, price: usd(gram24), unit: dict.markets.perGram },
    { k: dict.markets.gram, karat: dict.markets.karat21, karatEn: false, price: usd(gram24 * (21 / 24)), unit: dict.markets.perGram },
    { k: dict.markets.gram, karat: dict.markets.karat18, karatEn: false, price: usd(gram24 * (18 / 24)), unit: dict.markets.perGram },
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
                {gold.live && (
                  <div style={{ marginTop: 14 }}>
                    <span className="chg up">
                      <span className="pulse-dot" /> LIVE
                    </span>
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
