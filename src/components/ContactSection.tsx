import type { Dict } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import Reveal from "./Reveal";

/**
 * Where the company is and when it is open, beside the map.
 *
 * The page heading lives on the page itself, so this section does not repeat
 * it. Getting in touch is handled by the department lines above — a customer
 * calls or messages WhatsApp rather than filling in a form, so there is no
 * form here and nothing on this section needs JavaScript.
 */
export default function ContactSection({
  dict,
  locale = "ar",
}: {
  dict: Dict;
  locale?: Locale;
}) {
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    dict.contact.mapQuery
  )}&hl=${locale}&z=16&output=embed`;
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    dict.contact.mapQuery
  )}`;

  const lines = [
    {
      icon: "✆",
      label: dict.contact.phone,
      value: dict.contact.phoneValue,
      href: `tel:${dict.contact.phoneValue.replace(/\s/g, "")}`,
      latin: true,
    },
    {
      icon: "✉",
      label: dict.contact.email,
      value: dict.contact.emailValue,
      href: `mailto:${dict.contact.emailValue}`,
      latin: true,
    },
    {
      icon: "⌖",
      label: dict.contact.address,
      value: dict.contact.addressValue,
      href: mapLink,
      latin: false,
    },
    {
      icon: "◷",
      label: dict.contact.hours,
      value: dict.contact.hoursValue,
      href: null,
      latin: false,
    },
  ];

  return (
    <section className="contact" id="contact">
      <div className="wrap">
        <div className="contact-grid">
          <Reveal className="contact-info">
            {lines.map((line) => {
              const body = (
                <>
                  <div className="ic" aria-hidden>
                    {line.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="lbl">{line.label}</div>
                  </div>
                  <div className={`val${line.latin ? "" : " ar-val"}`}>{line.value}</div>
                </>
              );

              return line.href ? (
                <a
                  className="info-line is-link"
                  key={line.label}
                  href={line.href}
                  {...(line.href === mapLink
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {body}
                </a>
              ) : (
                <div className="info-line" key={line.label}>
                  {body}
                </div>
              );
            })}
          </Reveal>

          <Reveal delay={0.15} className="contact-map">
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
              style={{ marginTop: 14 }}
            >
              {dict.contact.mapOpen} <span>{dict.arrow}</span>
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
