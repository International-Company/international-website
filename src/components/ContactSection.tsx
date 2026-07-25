"use client";

import { useState } from "react";
import type { Dict } from "@/dictionaries";
import Reveal from "./Reveal";

export default function ContactSection({ dict }: { dict: Dict }) {
  const [sent, setSent] = useState(false);
  const f = dict.contact.form;

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
              <div className="val">{dict.contact.phoneValue}</div>
            </div>
            <div className="info-line">
              <div className="ic">✉</div>
              <div style={{ flex: 1 }}><div className="lbl">{dict.contact.email}</div></div>
              <div className="val">{dict.contact.emailValue}</div>
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
            <div className="map-ph">{dict.contact.map}</div>
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
