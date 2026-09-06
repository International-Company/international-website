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
    tag: "خطوط الاتصال",
    title: "تواصل مع القسم\nالذي تحتاجه مباشرة",
    sub: "كل قسم لديه خطه الخاص — اتصل أو راسلنا على واتساب ويصلك الرد من الفريق المختص.",
    call: "اتصال",
    whatsapp: "واتساب",
    email: "بريد",
    inCharge: "المسؤول",
    socialTitle: "تابعنا على منصاتنا",
    socialSub: "آخر الأسعار والعروض والأخبار أولًا بأول.",
  },
  en: {
    tag: "Direct lines",
    title: "Reach the desk\nyou actually need",
    sub: "Every department has its own line — call or message on WhatsApp and the right team answers.",
    call: "Call",
    whatsapp: "WhatsApp",
    email: "Email",
    inCharge: "In charge",
    socialTitle: "Follow us",
    socialSub: "Rates, offers and announcements as they happen.",
  },
} as const;

export default function ContactChannels({
  locale,
  departments,
  socials,
}: {
  locale: Locale;
  departments: Department[];
  socials: { platform: Platform; url: string }[];
}) {
  if (departments.length === 0 && socials.length === 0) return null;

  const t = COPY[locale];

  return (
    <section className="channels" id="channels">
      <div className="wrap">
        {departments.length > 0 && (
          <>
            <Reveal>
              <div className="chapter-tag">{t.tag}</div>
              <h2 className="section-title">{t.title}</h2>
              <p className="section-sub">{t.sub}</p>
            </Reveal>

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
                      <span className="dept-ic" aria-hidden>
                        {dept.icon || "☎"}
                      </span>
                      <h3>{name}</h3>

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

                      <div className="dept-actions">
                        {dept.phone && (
                          <a className="dept-btn" href={`tel:${tel}`}>
                            <span aria-hidden>✆</span> {t.call}
                          </a>
                        )}
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
