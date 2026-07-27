"use client";

import { useState } from "react";
import type { Dict } from "@/dictionaries";
import { WHATSAPP_NUMBER } from "@/lib/site";

const SERVICES = ["remittances", "transfers", "exchange", "gold"] as const;
const CURRENCIES = ["ILS", "USD", "JOD", "EUR", "EGP", "SAR", "AED"];

type Status = "idle" | "sending" | "sent" | "error";

export default function RequestForm({ dict }: { dict: Dict }) {
  const f = dict.requestForm;
  const [service, setService] = useState<string>("remittances");
  const [status, setStatus] = useState<Status>("idle");

  const needsTransferFields = service === "remittances" || service === "transfers";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    setStatus("sending");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
      form.reset();
      setService("remittances");
      if (typeof window !== "undefined" && typeof window.gtag === "function") {
        window.gtag("event", "request_submitted", { service: payload.service });
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="contact-form req-form" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="rq-service">{f.service}</label>
        <div className="rq-chips">
          {SERVICES.map((s) => (
            <button
              key={s}
              type="button"
              className={service === s ? "on" : ""}
              onClick={() => setService(s)}
            >
              {f.services[s]}
            </button>
          ))}
        </div>
        <input type="hidden" id="rq-service" name="service" value={service} readOnly />
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="rq-name">{f.name} *</label>
          <input id="rq-name" name="name" type="text" placeholder={f.namePh} required />
        </div>
        <div className="field">
          <label htmlFor="rq-phone">{f.phone} *</label>
          <input
            id="rq-phone"
            name="phone"
            type="tel"
            placeholder={f.phonePh}
            required
            style={{ direction: "ltr", textAlign: "end" }}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="rq-amount">{f.amount}</label>
          <input
            id="rq-amount"
            name="amount"
            type="text"
            inputMode="decimal"
            placeholder={f.amountPh}
            style={{ direction: "ltr", textAlign: "end" }}
          />
        </div>
        <div className="field">
          <label htmlFor="rq-currency">{f.currency}</label>
          <select id="rq-currency" name="currency" className="rq-select" defaultValue="ILS">
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {needsTransferFields && (
        <div className="form-row">
          <div className="field">
            <label htmlFor="rq-country">{f.country}</label>
            <input id="rq-country" name="country" type="text" placeholder={f.countryPh} />
          </div>
          <div className="field">
            <label htmlFor="rq-recipient">{f.recipient}</label>
            <input id="rq-recipient" name="recipient" type="text" placeholder={f.recipientPh} />
          </div>
        </div>
      )}

      <div className="field">
        <label htmlFor="rq-note">{f.note}</label>
        <textarea id="rq-note" name="note" placeholder={f.notePh} />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={status === "sending"}
        style={{ width: "100%", justifyContent: "center", opacity: status === "sending" ? 0.7 : 1 }}
      >
        {status === "sending" ? f.sending : f.submit}{" "}
        <span className="arrow">{dict.arrow}</span>
      </button>

      {status === "sent" && <div className="form-success">{f.success}</div>}
      {status === "error" && (
        <div className="form-success" style={{ color: "var(--text-2)" }}>
          {f.error}
        </div>
      )}

      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-link"
        style={{ marginTop: 16, justifyContent: "center", width: "100%" }}
      >
        {f.orWhats} <span>{dict.arrow}</span>
      </a>
    </form>
  );
}
