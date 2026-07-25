/** Demo market data — wire to a live rates API in production. */
const TICKER = [
  { sym: "USD/SAR", prc: "3.7500", chg: "0.00%", up: true },
  { sym: "EUR/USD", prc: "1.0932", chg: "0.31%", up: true },
  { sym: "GBP/USD", prc: "1.2718", chg: "0.12%", up: false },
  { sym: "USD/AED", prc: "3.6725", chg: "0.00%", up: true },
  { sym: "USD/TRY", prc: "32.84", chg: "0.45%", up: false },
  { sym: "USD/EGP", prc: "48.52", chg: "0.18%", up: true },
  { sym: "XAU/USD", prc: "$2,412.30", chg: "0.64%", up: true },
  { sym: "XAG/USD", prc: "$29.14", chg: "0.22%", up: true },
];

export default function Ticker() {
  const items = [...TICKER, ...TICKER];
  return (
    <div className="ticker" aria-hidden>
      <div className="ticker-track">
        {items.map((t, i) => (
          <div className="tick-item" key={i}>
            <span className="sym">{t.sym}</span>
            <span className="prc">{t.prc}</span>
            <span className={`chg ${t.up ? "up" : "dn"}`}>
              {t.up ? "▲" : "▼"} {t.chg}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
