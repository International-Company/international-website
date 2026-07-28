import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getDict } from "@/dictionaries";
import { getFxRates } from "@/lib/rates";
import { getCompanyRates, getConverterRates } from "@/lib/rates-service";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import MoneyBand from "@/components/MoneyBand";
import GoldMarkets from "@/components/GoldMarkets";
import CompanyRates from "@/components/CompanyRates";
import ServicesBento from "@/components/ServicesBento";
import NetworkSection from "@/components/NetworkSection";
import Partners from "@/components/Partners";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";

// Company rates must appear as soon as the admin saves them.
export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);
  const fx = await getFxRates();
  const company = await getCompanyRates();
  const converter = await getConverterRates(fx.rates);

  return (
    <>
      <Hero
        dict={dict}
        locale={locale}
        rates={converter.rates}
        source={converter.source}
      />
      <Stats dict={dict} />
      <MoneyBand dict={dict} />

      {company.live ? (
        <section className="markets" id="markets">
          <div className="wrap">
            <CompanyRates
              dict={dict}
              locale={locale}
              rates={company.rates}
              updatedAt={company.updatedAt}
              live={company.live}
              withHeader
              withCta
            />
          </div>
        </section>
      ) : (
        <GoldMarkets dict={dict} />
      )}

      <ServicesBento dict={dict} locale={locale} />
      <NetworkSection dict={dict} />
      <Partners dict={dict} />
      <Testimonials dict={dict} />
      <FAQ dict={dict} />
    </>
  );
}
