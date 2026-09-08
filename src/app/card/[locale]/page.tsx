import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import { getContent } from "@/lib/content";
import {
  digits,
  getPublicDepartments,
  getSocialLinks,
  nameInitial,
} from "@/lib/contact-config";
import { getGallery } from "@/lib/gallery-config";
import { getBlockOrder, type BlockId } from "@/lib/contact-layout";
import { getImages } from "@/lib/media";
import SocialIcon from "@/components/SocialIcon";
import GalleryCard from "@/components/GalleryCard";

/**
 * The page a QR code leads to.
 *
 * Everything on it either dials, opens WhatsApp, or leaves for the showroom.
 * There is not one link back into the site, which is the whole point: this is
 * what a printed code at the counter should open, not a way in to browsing.
 */

export const dynamic = "force-dynamic";

const COPY = {
  ar: { whatsapp: "واتساب", inCharge: "المسؤول", follow: "تابعنا" },
  en: { whatsapp: "WhatsApp", inCharge: "In charge", follow: "Follow us" },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getContent(locale);
  return { title: `${dict.brand.ar} — ${dict.contact.title}` };
}

export default async function CardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;

  const dict = await getContent(locale);
  const departments = await getPublicDepartments();
  const socials = await getSocialLinks();
  const gallery = await getGallery();
  const images = await getImages();
  const order = await getBlockOrder();
  const t = COPY[locale];
  const ar = locale === "ar";

  const blocks: Record<BlockId, React.ReactNode> = {
    departments:
      departments.length > 0 ? (
        <ul className="card-list" key="departments">
          {departments.map((dept, i) => {
            const name = (ar ? dept.nameAr : dept.nameEn) || dept.nameAr;
            const person = ar
              ? dept.personAr || dept.personEn
              : dept.personEn || dept.personAr;
            const tel = digits(dept.phone);

            return (
              <li className="card-row" key={`${name}-${i}`}>
                <div className="card-row-main">
                  <span className="card-dept">{name}</span>
                  {person && (
                    <span className="card-person">
                      <span className="card-initial" aria-hidden>
                        {nameInitial(person)}
                      </span>
                      <span>
                        <small>{t.inCharge}</small>
                        <b>{person}</b>
                      </span>
                    </span>
                  )}
                  {dept.phone && (
                    <a className="card-num" href={`tel:${tel}`} dir="ltr">
                      {dept.phone}
                    </a>
                  )}
                </div>

                {dept.whatsapp && (
                  <a
                    className="card-wa"
                    href={`https://wa.me/${dept.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="wa-mark" aria-hidden>
                      <SocialIcon id="whatsapp" />
                    </span>
                    {t.whatsapp}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      ) : null,

    gallery: (
      <GalleryCard
        key="gallery"
        locale={locale}
        gallery={gallery}
        emblem={images["gallery-emblem"]}
      />
    ),

    social:
      socials.length > 0 ? (
        <section className="card-social" key="social">
          <span className="card-social-label">{t.follow}</span>
          <ul>
            {socials.map(({ platform, url }) => (
              <li key={platform.id}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn"
                  style={{ ["--brand" as string]: platform.color }}
                  aria-label={ar ? platform.label : platform.labelEn}
                  title={ar ? platform.label : platform.labelEn}
                >
                  <SocialIcon id={platform.id} />
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null,
  };

  return (
    <main className="card-page">
      <header className="card-head">
        <Image
          src={images.logo}
          alt=""
          width={82}
          height={82}
          className="card-logo"
          priority
          unoptimized={images.logo.startsWith("/api/")}
        />
        <h1>{ar ? dict.brand.ar : dict.brand.en}</h1>
        <p>{dict.preloader.tagline}</p>
      </header>

      {order.map((id) => blocks[id])}
    </main>
  );
}
