"use client";

import { useState } from "react";
import type { Dict } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import { CONTACT_EMAIL } from "@/lib/site";
import Reveal from "./Reveal";

type FormStatus = "idle" | "sending" | "sent" | "error";

export default function ContactSection({
  dict,
  locale = "ar",
}: {
  dict: Dict;
  locale?: Locale;
}) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const f = dict.contact.form;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("sending");
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...data,
          _subject: "رسالة جديدة من موقع إنترنشونال — New website message",
          _template: "table",
        }),
      });
      if (!res.ok) throw new Error(`formsubmit ${res.status}`);
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    dict.contact.mapQuery
  )}&hl=${locale}&z=16&output=embed`;
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    dict.contact.mapQuery
  )}`;

  return (
    <section className="contact" id="contact">
      <div className="wrap">
        <Reveal>
          <div className="chapter-tag">{dict.contact.tag}</div>
          <h2 className="section-title">{dict.contact.title}</h2>
        </Reveal>

        <div className="contact-grid">
          <Reveal delay={0.1} className="contact-info">
            <div className="info-line">
              <div className="ic">✆</div>
              <div style={{ flex: 1 }}><div className="lbl">{dict.contact.phone}</div></div>
              <a
                className="val"
                href={`tel:${dict.contact.phoneValue.replace(/\s/g, "")}`}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                {dict.contact.phoneValue}
              </a>
            </div>
            <div className="info-line">
              <div className="ic">✉</div>
              <div style={{ flex: 1 }}><div className="lbl">{dict.contact.email}</div></div>
              <a
                className="val"
                href={`mailto:${dict.contact.emailValue}`}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                {dict.contact.emailValue}
              </a>
            </div>
            <div className="info-line">
              <div className="ic">⌖</div>
              <div style={{ flex: 1 }}><div className="lbl">{dict.contact.address}</div></div>
              <div className="val ar-val">{dict.contact.addressValue}</div>
            </div>
            <div className="info-line">
              <div className="ic">◷</div>
              <div style={{ flex: 1 }}><div className="lbl">{dict.contact.hours}</div></div>
              <div className="val ar-val">{dict.contact.hoursValue}</div>
            </div>
            <div className="map-embed">
              <iframe
                src={mapSrc}
                title={dict.contact.map}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href={mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
              style={{ marginTop: 12 }}
            >
              {dict.contact.mapOpen} <span>{dict.arrow}</span>
            </a>
          </Reveal>

          <Reveal delay={0.2}>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="cf-name">{f.name}</label>
                  <input id="cf-name" name="name" type="text" placeholder={f.namePh} required />
                </div>
                <div className="field">
                  <label htmlFor="cf-phone">{f.phone}</label>
                  <input
                    id="cf-phone"
                    name="phone"
                    type="tel"
                    placeholder={f.phonePh}
                    style={{ direction: "ltr", textAlign: "end" }}
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="cf-email">{f.email}</label>
                <input
                  id="cf-email"
                  name="email"
                  type="email"
                  placeholder={f.emailPh}
                  style={{ direction: "ltr", textAlign: "end" }}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="cf-service">{f.service}</label>
                <input id="cf-service" name="service" type="text" placeholder={f.servicePh} />
              </div>
              <div className="field">
                <label htmlFor="cf-message">{f.message}</label>
                <textarea id="cf-message" name="message" placeholder={f.messagePh} required />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={status === "sending"}
                style={{
                  width: "100%",
                  justifyContent: "center",
                  opacity: status === "sending" ? 0.7 : 1,
                }}
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
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
