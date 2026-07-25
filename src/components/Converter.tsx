"use client";

import { useState } from "react";
import type { Dict } from "@/dictionaries";
import { FX_FALLBACK, type FxRates } from "@/lib/rates";
import { WHATSAPP_NUMBER } from "@/lib/site";

const CURRENCIES = ["USD", "ILS", "EUR", "GBP", "SAR", "AED", "TRY", "EGP"];

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

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

const fmt = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const parse = (s: string) => parseFloat(s.replace(/,/g, "")) || 0;

export default function Converter({
  dict,
  rates,
}: {
  dict: Dict;
  rates?: FxRates;
}) {
  const r = rates ?? FX_FALLBACK;
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("ILS");
  const [send, setSend] = useState("1,000");
  const [recv, setRecv] = useState(() => fmt((1000 / (r.USD ?? 1)) * (r.ILS ?? 3.05)));

  const available = CURRENCIES.filter((c) => typeof r[c] === "number");
  const nameOf = (c: string) => dict.converter.names[c] ?? c;
  const convert = (n: number, f: string, t: string) => (n / r[f]) * r[t];

  const onSendChange = (v: string) => {
    setSend(v);
    const n = parse(v);
    setRecv(n > 0 ? fmt(convert(n, from, to)) : "");
  };

  const onRecvChange = (v: string) => {
    setRecv(v);
    const n = parse(v);
    setSend(n > 0 ? fmt(convert(n, to, from)) : "");
  };

  const onFromChange = (c: string) => {
    setFrom(c);
    const n = parse(send);
    setRecv(n > 0 ? fmt(convert(n, c, to)) : "");
  };

  const onToChange = (c: string) => {
    setTo(c);
    const n = parse(send);
    setRecv(n > 0 ? fmt(convert(n, from, c)) : "");
  };

  const swap = () => {
    const nf = to;
    const nt = from;
    setFrom(nf);
    setTo(nt);
    const n = parse(send);
    setRecv(n > 0 ? fmt(convert(n, nf, nt)) : "");
  };

  const setQuick = (n: number) => {
    setSend(n.toLocaleString("en-US"));
    setRecv(fmt(convert(n, from, to)));
  };

  const rate = r[to] / r[from];
  const waText = dict.converter.waText
    .replace("{amount}", `${send} ${from}`)
    .replace("{from}", nameOf(from))
    .replace("{to}", nameOf(to));
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;

  return (
    <div className="converter">
      <div className="conv-head">
        <span className="t">{dict.converter.title}</span>
        <span className="live">
          <span className="pulse-dot" /> {dict.converter.live}
        </span>
      </div>

      <div className="conv2-body">
        {/* You send */}
        <div className="conv2-panel">
          <label htmlFor="conv-send">{dict.converter.send}</label>
          <div className="conv2-row">
            <input
              id="conv-send"
              className="conv2-amount"
              type="text"
              inputMode="decimal"
              value={send}
              onChange={(e) => onSendChange(e.target.value)}
              onBlur={() => {
                const n = parse(send);
                if (n > 0) setSend(n.toLocaleString("en-US", { maximumFractionDigits: 2 }));
              }}
            />
            <div className="conv2-cur">
              <span className="sym">{SYMBOLS[from]}</span>
              <span className="code">{from}</span>
              <span className="chev">▾</span>
              <select
                aria-label={dict.converter.from}
                value={from}
                onChange={(e) => onFromChange(e.target.value)}
              >
                {available.map((c) => (
                  <option key={c} value={c}>
                    {SYMBOLS[c]} {nameOf(c)} ({c})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button type="button" className="conv2-swap" title={dict.converter.swap} onClick={swap}>
          ⇄
        </button>

        {/* They receive */}
        <div className="conv2-panel">
          <label htmlFor="conv-recv">{dict.converter.receive}</label>
          <div className="conv2-row">
            <input
              id="conv-recv"
              className="conv2-amount"
              type="text"
              inputMode="decimal"
              value={recv}
              onChange={(e) => onRecvChange(e.target.value)}
            />
            <div className="conv2-cur">
              <span className="sym">{SYMBOLS[to]}</span>
              <span className="code">{to}</span>
              <span className="chev">▾</span>
              <select
                aria-label={dict.converter.to}
                value={to}
                onChange={(e) => onToChange(e.target.value)}
              >
                {available.map((c) => (
                  <option key={c} value={c}>
                    {SYMBOLS[c]} {nameOf(c)} ({c})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="conv2-chips">
        {QUICK_AMOUNTS.map((n) => (
          <button key={n} type="button" onClick={() => setQuick(n)}>
            {n.toLocaleString("en-US")}
          </button>
        ))}
      </div>

      <div className="conv2-rate">
        <span className="pulse-dot" />
        <span>1 {from} = {rate.toFixed(4)} {to}</span>
        <span className="sep">·</span>
        <span>1 {to} = {(1 / rate).toFixed(4)} {from}</span>
      </div>

      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary conv2-cta"
      >
        ✆ {dict.converter.cta}
      </a>
      <small className="conv2-note">{dict.converter.note}</small>
    </div>
  );
}
