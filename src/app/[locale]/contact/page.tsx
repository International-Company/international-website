import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getContent } from "@/lib/content";
import { getSiteConfig } from "@/lib/site-config";
import { getPublicDepartments, getSocialLinks } from "@/lib/contact-config";
import ContactChannels from "@/components/ContactChannels";
import ContactSection from "@/components/ContactSection";
import Branches from "@/components/Branches";
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
  const site = await getSiteConfig();
  const departments = await getPublicDepartments();
  const socials = await getSocialLinks();

  return (
    <>
      <div className="page-head">
        <div className="wrap">
          <Reveal>
            <div className="chapter-tag">{dict.contact.tag}</div>
            <h1 className="section-title">{dict.contact.title}</h1>
          </Reveal>
        </div>
      </div>
      <ContactSection dict={dict} locale={locale} formsubmitId={site.formsubmitId} />
      <ContactChannels locale={locale} departments={departments} socials={socials} />
      <Branches dict={dict} />
    </>
  );
}
