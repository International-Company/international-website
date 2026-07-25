"use client";

import { useState } from "react";
import type { Dict } from "@/dictionaries";
import { FX_FALLBACK, type FxRates } from "@/lib/rates";

const CURRENCIES = ["USD", "ILS", "EUR", "GBP", "SAR", "AED", "TRY", "EGP"];

/** Currency symbols shown next to the localized name. */
const SYMBOLS: Record<string, string> = {
  USD: "$",
  ILS: "₪",
  EUR: "€",
  GBP: "£",
  SAR: "﷼",
  AED: "د.إ",
  TRY: "₺",
  EGP: "£",
};

const fmt = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function Converter({
  dict,
  rates,
}: {
  dict: Dict;
  rates?: FxRates;
}) {
  const r = rates ?? FX_FALLBACK;
  const [amount, setAmount] = useState("1000");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("ILS");

  const available = CURRENCIES.filter((c) => typeof r[c] === "number");
  const value = ((parseFloat(amount) || 0) / r[from]) * r[to];
  const nameOf = (c: string) => dict.converter.names[c] ?? c;

  return (
    <div className="converter">
      <div className="conv-head">
        <span className="t">{dict.converter.title}</span>
        <span className="live">
          <span className="pulse-dot" /> {dict.converter.live}
        </span>
      </div>
      <div className="conv-row">
        <div className="conv-field">
          <label htmlFor="conv-amount">{dict.converter.amount}</label>
          <input
            id="conv-amount"
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="conv-field">
          <label htmlFor="conv-from">{dict.converter.from}</label>
          <select id="conv-from" value={from} onChange={(e) => setFrom(e.target.value)}>
            {available.map((c) => (
              <option key={c} value={c}>{nameOf(c)} {SYMBOLS[c]}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="conv-swap"
          title={dict.converter.swap}
          onClick={() => { setFrom(to); setTo(from); }}
        >
          ⇅
        </button>
        <div className="conv-field">
          <label htmlFor="conv-to">{dict.converter.to}</label>
          <select id="conv-to" value={to} onChange={(e) => setTo(e.target.value)}>
            {available.map((c) => (
              <option key={c} value={c}>{nameOf(c)} {SYMBOLS[c]}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="conv-result">
        <span className="out">
          {fmt.format(value)} <span className="out-name">{nameOf(to)}</span>
        </span>
        <small>{dict.converter.note}</small>
      </div>
    </div>
  );
}
