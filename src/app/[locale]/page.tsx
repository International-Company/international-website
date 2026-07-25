import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getDict } from "@/dictionaries";
import { getFxRates } from "@/lib/rates";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import GoldMarkets from "@/components/GoldMarkets";
import ServicesBento from "@/components/ServicesBento";
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
  const fx = await getFxRates();

  return (
    <>
      <Hero dict={dict} locale={locale} rates={fx.rates} />
      <Stats dict={dict} />
      <GoldMarkets dict={dict} />
      <ServicesBento dict={dict} locale={locale} />
      <NetworkSection dict={dict} />
      <Partners dict={dict} />
      <Testimonials dict={dict} />
      <FAQ dict={dict} />
    </>
  );
}
