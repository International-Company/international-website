"use client";

import { useState } from "react";
import type { Dict } from "@/dictionaries";
import type { ConverterRate } from "@/lib/rates-service";

const SYMBOLS: Record<string, string> = {
  ILS: "₪",
  USD: "$",
  JOD: "د.ا",
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
  locale,
  rates,
  source,
}: {
  dict: Dict;
  locale: string;
  rates: ConverterRate[];
  source: "shop" | "market";
}) {
  const byCode = new Map(rates.map((r) => [r.code, r]));
  const initialFrom = byCode.has("USD") ? "USD" : (rates[1]?.code ?? "ILS");

  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState("ILS");

  /**
   * Real counter maths: the shop buys what you hand over at its `buy` price
   * and sells what you take away at its `sell` price.
   */
  const convert = (amount: number, f: string, t: string) => {
    const src = byCode.get(f);
    const dst = byCode.get(t);
    if (!src || !dst || dst.sell <= 0) return 0;
    return (amount * src.buy) / dst.sell;
  };

  const invert = (amount: number, f: string, t: string) => {
    const src = byCode.get(f);
    const dst = byCode.get(t);
    if (!src || !dst || src.buy <= 0) return 0;
    return (amount * dst.sell) / src.buy;
  };

  const [send, setSend] = useState("1,000");
  const [recv, setRecv] = useState(() => fmt(convert(1000, initialFrom, "ILS")));

  const nameOf = (code: string) => {
    const dictName = dict.converter.names[code];
    if (dictName) return dictName;
    const r = byCode.get(code);
    return r ? (locale === "ar" ? r.nameAr : r.nameEn) : code;
  };

  const onSendChange = (v: string) => {
    setSend(v);
    const n = parse(v);
    setRecv(n > 0 ? fmt(convert(n, from, to)) : "");
  };

  const onRecvChange = (v: string) => {
    setRecv(v);
    const n = parse(v);
    setSend(n > 0 ? fmt(invert(n, from, to)) : "");
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

  const unitRate = convert(1, from, to);
  const activeQuick = parse(send);

  return (
    <div className="converter">
      <div className="conv-head">
        <span className="t">{dict.converter.title}</span>
        <span className="live">
          <span className="pulse-dot" />{" "}
          {source === "shop" ? dict.converter.shopRates : dict.converter.marketRates}
        </span>
      </div>

      <div className="conv2-body">
        <div className="conv2-panel">
          <label htmlFor="conv-send">{dict.converter.send}</label>
          <div className="conv2-row">
            <input
              id="conv-send"
              className="conv2-amount"
              type="text"
              inputMode="decimal"
              lang="en"
              value={send}
              onChange={(e) => onSendChange(e.target.value)}
              onBlur={() => {
                const n = parse(send);
                if (n > 0) setSend(n.toLocaleString("en-US", { maximumFractionDigits: 2 }));
              }}
            />
            <div className="conv2-cur">
              <span className="sym">{SYMBOLS[from] ?? from.slice(0, 2)}</span>
              <span className="code">{from}</span>
              <span className="chev">▾</span>
              <select
                aria-label={dict.converter.from}
                value={from}
                onChange={(e) => onFromChange(e.target.value)}
              >
                {rates.map((r) => (
                  <option key={r.code} value={r.code}>
                    {SYMBOLS[r.code] ?? ""} {nameOf(r.code)} ({r.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <span className="conv2-name">{nameOf(from)}</span>
        </div>

        <button type="button" className="conv2-swap" title={dict.converter.swap} onClick={swap}>
          ⇄
        </button>

        <div className="conv2-panel">
          <label htmlFor="conv-recv">{dict.converter.receive}</label>
          <div className="conv2-row">
            <input
              id="conv-recv"
              className="conv2-amount"
              type="text"
              inputMode="decimal"
              lang="en"
              value={recv}
              onChange={(e) => onRecvChange(e.target.value)}
            />
            <div className="conv2-cur">
              <span className="sym">{SYMBOLS[to] ?? to.slice(0, 2)}</span>
              <span className="code">{to}</span>
              <span className="chev">▾</span>
              <select
                aria-label={dict.converter.to}
                value={to}
                onChange={(e) => onToChange(e.target.value)}
              >
                {rates.map((r) => (
                  <option key={r.code} value={r.code}>
                    {SYMBOLS[r.code] ?? ""} {nameOf(r.code)} ({r.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <span className="conv2-name">{nameOf(to)}</span>
        </div>
      </div>

      <div className="conv2-chips">
        {QUICK_AMOUNTS.map((n) => (
          <button
            key={n}
            type="button"
            className={activeQuick === n ? "active" : ""}
            onClick={() => setQuick(n)}
          >
            {n.toLocaleString("en-US")}
          </button>
        ))}
      </div>

      <div className="conv2-rate">
        <span className="pulse-dot" />
        <span>
          1 {from} = {unitRate >= 1 ? unitRate.toFixed(4) : unitRate.toFixed(6)} {to}
        </span>
      </div>

      <small className="conv2-note">
        {source === "shop" ? dict.converter.shopNote : dict.converter.note}
      </small>
    </div>
  );
}
