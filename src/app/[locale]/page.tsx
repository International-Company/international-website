import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getDict } from "@/dictionaries";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import GoldMarkets from "@/components/GoldMarkets";
import ServicesScrolly from "@/components/ServicesScrolly";
import NetworkSection from "@/components/NetworkSection";
import Partners from "@/components/Partners";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);

  return (
    <>
      <Hero dict={dict} locale={locale} />
      <Stats dict={dict} />
      <GoldMarkets dict={dict} />
      <ServicesScrolly dict={dict} locale={locale} />
      <NetworkSection dict={dict} />
      <Partners dict={dict} />
      <Testimonials dict={dict} />
      <FAQ dict={dict} />
    </>
  );
}
