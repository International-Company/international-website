import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getDict } from "@/dictionaries";
import Reveal from "@/components/Reveal";
import RequestForm from "@/components/RequestForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDict(locale);
  return { title: dict.requestForm.navLabel, description: dict.requestForm.sub };
}

export default async function RequestPage({
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
            <div className="chapter-tag">{dict.requestForm.tag}</div>
            <h1 className="section-title">{dict.requestForm.title}</h1>
            <p className="section-sub">{dict.requestForm.sub}</p>
          </Reveal>
        </div>
      </div>

      <section style={{ padding: "70px 0 110px", background: "var(--bg)" }}>
        <div className="wrap" style={{ maxWidth: 720 }}>
          <Reveal>
            <RequestForm dict={dict} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
