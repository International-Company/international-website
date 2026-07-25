"use client";

import { useState } from "react";
import type { Dict } from "@/dictionaries";

/** Demo rates per 1 USD — replace with a live rates API in production. */
const RATES: Record<string, number> = {
  USD: 1,
  ILS: 3.65,
  EUR: 0.9151,
  GBP: 0.7863,
  SAR: 3.75,
  AED: 3.6725,
  TRY: 32.84,
};

const LABELS: Record<string, string> = {
  USD: "USD $",
  ILS: "ILS ₪",
  EUR: "EUR €",
  GBP: "GBP £",
  SAR: "SAR ﷼",
  AED: "AED د.إ",
  TRY: "TRY ₺",
};

const fmt = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function Converter({ dict }: { dict: Dict }) {
  const [amount, setAmount] = useState("1000");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("ILS");

  const value = (parseFloat(amount) || 0) / RATES[from] * RATES[to];

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
            {Object.keys(RATES).map((c) => (
              <option key={c} value={c}>{LABELS[c]}</option>
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
            {Object.keys(RATES).map((c) => (
              <option key={c} value={c}>{LABELS[c]}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="conv-result">
        <span className="out">{fmt.format(value)} {to}</span>
        <small>{dict.converter.note}</small>
      </div>
    </div>
  );
}
