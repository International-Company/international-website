import { getFxRates, getMetalPrice } from "@/lib/rates";

const fx4 = (n: number) => (n >= 100 ? n.toFixed(2) : n.toFixed(4));

export default async function Ticker() {
  const [fx, gold, silver] = await Promise.all([
    getFxRates(),
    getMetalPrice("XAU"),
    getMetalPrice("XAG"),
  ]);
  const r = fx.rates;

  const data = [
    { sym: "USD/ILS", prc: fx4(r.ILS) },
    { sym: "USD/SAR", prc: fx4(r.SAR) },
    { sym: "USD/AED", prc: fx4(r.AED) },
    { sym: "EUR/USD", prc: (1 / r.EUR).toFixed(4) },
    { sym: "GBP/USD", prc: (1 / r.GBP).toFixed(4) },
    { sym: "USD/TRY", prc: fx4(r.TRY) },
    { sym: "USD/EGP", prc: fx4(r.EGP) },
    {
      sym: "XAU/USD",
      prc: "$" + gold.price.toLocaleString("en-US", { maximumFractionDigits: 0 }),
    },
    { sym: "XAG/USD", prc: "$" + silver.price.toFixed(2) },
  ];

  const items = [...data, ...data];
  return (
    <div className="ticker" aria-hidden>
      <div className="ticker-track">
        {items.map((t, i) => (
          <div className="tick-item" key={i}>
            <span className="sym">{t.sym}</span>
            <span className="prc">{t.prc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
