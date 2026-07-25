"use client";

import { useState } from "react";
import type { Dict } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import Reveal from "./Reveal";

export default function ContactSection({
  dict,
  locale = "ar",
}: {
  dict: Dict;
  locale?: Locale;
}) {
  const [sent, setSent] = useState(false);
  const f = dict.contact.form;
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
            <form
              className="contact-form"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <div className="form-row">
                <div className="field">
                  <label htmlFor="cf-name">{f.name}</label>
                  <input id="cf-name" type="text" placeholder={f.namePh} required />
                </div>
                <div className="field">
                  <label htmlFor="cf-phone">{f.phone}</label>
                  <input
                    id="cf-phone"
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
                  type="email"
                  placeholder={f.emailPh}
                  style={{ direction: "ltr", textAlign: "end" }}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="cf-service">{f.service}</label>
                <input id="cf-service" type="text" placeholder={f.servicePh} />
              </div>
              <div className="field">
                <label htmlFor="cf-message">{f.message}</label>
                <textarea id="cf-message" placeholder={f.messagePh} required />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                {f.submit} <span className="arrow">{dict.arrow}</span>
              </button>
              {sent && <div className="form-success">{f.success}</div>}
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
