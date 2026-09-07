import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getContent } from "@/lib/content";
import { getPublicDepartments, getSocialLinks } from "@/lib/contact-config";
import { getGallery } from "@/lib/gallery-config";
import { getImages } from "@/lib/media";
import ContactChannels from "@/components/ContactChannels";
import GalleryCard from "@/components/GalleryCard";
import Reveal from "@/components/Reveal";

// Departments and social links come from the panel and must appear on save.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getContent(locale);
  return { title: dict.nav.contact };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getContent(locale);
  const departments = await getPublicDepartments();
  const socials = await getSocialLinks();
  const gallery = await getGallery();
  const images = await getImages();

  return (
    <>
      {/* Two words, centred, with a rule under them — nothing else needs
          saying before the numbers themselves. */}
      <div className="page-head page-head-plain">
        <div className="wrap">
          <Reveal>
            <h1 className="page-title-solo">{dict.contact.title}</h1>
          </Reveal>
        </div>
      </div>
      <ContactChannels
        locale={locale}
        departments={departments}
        socials={socials}
        gallery={
          <GalleryCard
            locale={locale}
            gallery={gallery}
            emblem={images["gallery-emblem"]}
          />
        }
      />
    </>
  );
}
