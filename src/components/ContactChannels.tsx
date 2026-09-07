import type { Locale } from "@/lib/i18n";
import { digits, nameInitial, type Department, type Platform } from "@/lib/contact-config";
import SocialIcon from "./SocialIcon";
import Reveal from "./Reveal";

/**
 * Departments and social profiles, both filled from the admin panel.
 *
 * Every card leads somewhere: the number dials, the WhatsApp button opens a
 * chat pre-addressed to that desk. Departments with nothing to dial are
 * filtered out upstream, and the whole section disappears when the panel has
 * not been filled in yet — an empty grid of placeholders would look worse
 * than no section at all.
 */

const COPY = {
  ar: {
    whatsapp: "واتساب",
    email: "بريد",
    inCharge: "المسؤول",
    website: "زيارة الموقع",
    socialTitle: "تابعنا على منصاتنا",
    socialSub: "آخر الأسعار والعروض والأخبار أولًا بأول.",
  },
  en: {
    whatsapp: "WhatsApp",
    email: "Email",
    inCharge: "In charge",
    website: "Visit site",
    socialTitle: "Follow us",
    socialSub: "Rates, offers and announcements as they happen.",
  },
} as const;

export default function ContactChannels({
  locale,
  departments,
  socials,
  gallery,
}: {
  locale: Locale;
  departments: Department[];
  socials: { platform: Platform; url: string }[];
  /** The showroom block, or a component that renders nothing when it is off. */
  gallery?: React.ReactNode;
}) {
  if (departments.length === 0 && socials.length === 0 && !gallery) return null;

  const t = COPY[locale];

  return (
    <section className="channels" id="channels">
      <div className="wrap">
        {departments.length > 0 && (
          <>
            {/* No heading here: the page above already introduces the page,
                and a second title stacked under the first read as a repeat. */}
            <div className="dept-grid">
              {departments.map((dept, i) => {
                const name = (locale === "ar" ? dept.nameAr : dept.nameEn) || dept.nameAr;
                // Either spelling may be the only one filled in, so the
                // fallback runs both ways rather than only towards Arabic.
                const person =
                  locale === "ar"
                    ? dept.personAr || dept.personEn
                    : dept.personEn || dept.personAr;
                const tel = digits(dept.phone);

                return (
                  <Reveal key={`${name}-${i}`} delay={0.06 * i}>
                    <article className="dept-card">
                      <header className="dept-top">
                        <h3>{name}</h3>
                      </header>

                      {person && (
                        <div className="dept-person">
                          <span className="dept-avatar" aria-hidden>
                            {nameInitial(person)}
                          </span>
                          <span>
                            <small>{t.inCharge}</small>
                            <b>{person}</b>
                          </span>
                        </div>
                      )}

                      {dept.phone && (
                        <a className="dept-num" href={`tel:${tel}`} dir="ltr">
                          {dept.phone}
                        </a>
                      )}
                      {dept.email && (
                        <a className="dept-mail" href={`mailto:${dept.email}`} dir="ltr">
                          {dept.email}
                        </a>
                      )}

                      {dept.website && (
                        <a
                          className="dept-site"
                          href={dept.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t.website}
                          <span aria-hidden>↗</span>
                        </a>
                      )}

                      <div className="dept-actions">
                        {dept.whatsapp && (
                          <a
                            className="dept-btn wa"
                            href={`https://wa.me/${dept.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span aria-hidden>✆</span> {t.whatsapp}
                          </a>
                        )}
                      </div>

                    </article>
                  </Reveal>
                );
              })}
            </div>
          </>
        )}

        {gallery && <Reveal delay={0.08}>{gallery}</Reveal>}

        {socials.length > 0 && (
          <Reveal delay={0.1}>
            <div className="social-band">
              <div className="social-copy">
                <h3>{t.socialTitle}</h3>
                <p>{t.socialSub}</p>
              </div>
              <ul className="social-row">
                {socials.map(({ platform, url }) => (
                  <li key={platform.id}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`social-btn s-${platform.id}`}
                      style={{ ["--brand" as string]: platform.color }}
                      aria-label={locale === "ar" ? platform.label : platform.labelEn}
                      title={locale === "ar" ? platform.label : platform.labelEn}
                    >
                      <SocialIcon id={platform.id} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
