import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getDict } from "@/dictionaries";
import AboutSection from "@/components/AboutSection";
import Stats from "@/components/Stats";
import Partners from "@/components/Partners";
import Reveal from "@/components/Reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDict(locale);
  return { title: dict.nav.about };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);

  return (
    <>
      <div className="page-head">
        <div className="wrap">
          <Reveal>
            <div className="chapter-tag">{dict.about.tag}</div>
            <h1 className="section-title">{dict.about.title}</h1>
          </Reveal>
        </div>
      </div>
      <AboutSection dict={dict} />
      <Stats dict={dict} />
      <Partners dict={dict} />
    </>
  );
}
