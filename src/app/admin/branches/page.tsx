import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthed } from "@/lib/auth";
import { hasDb } from "@/lib/db";
import { isLocale, type Locale } from "@/lib/i18n";
import { getContent } from "@/lib/content";
import { findGroup } from "@/lib/content-schema";
import { buildEditorData } from "@/lib/content-editor-data";
import Chrome from "../_components/Chrome";
import ContentEditor from "../_components/ContentEditor";

export const dynamic = "force-dynamic";

export default async function AdminBranchesPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  if (!(await isAuthed())) redirect("/admin/login");

  const sp = await searchParams;
  const locale: Locale = isLocale(sp.lang ?? "") ? (sp.lang as Locale) : "ar";

  const group = findGroup("contact");
  if (!group) redirect("/admin");

  const dict = await getContent(locale);
  const data = buildEditorData(group, dict);

  return (
    <Chrome
      active="/admin/branches"
      title="الفروع"
      subtitle="عناوين الفروع ونصوص صفحة التواصل"
      actions={
        <Link href={`/${locale}/contact`} className="a-btn ghost sm" target="_blank">
          ↗ صفحة التواصل
        </Link>
      }
    >
      <div className="a-note">
        أرقام الهاتف والواتساب وروابط التواصل الاجتماعي تُعدَّل من قسم{" "}
        <Link href="/admin/contact">تواصل معنا</Link>.
      </div>

      <div className="a-langbar">
        <div className="a-langs">
          <Link href="/admin/branches?lang=ar" className={locale === "ar" ? "on" : ""}>
            🇵🇸 العربية
          </Link>
          <Link href="/admin/branches?lang=en" className={locale === "en" ? "on" : ""}>
            🇬🇧 English
          </Link>
        </div>
        <p className="a-langbar-hint">
          النصوص المعروضة (أسماء الفروع والعناوين) تُكتب لكل لغة على حدة.
        </p>
      </div>

      <ContentEditor
        key={`branches:${locale}`}
        group={group}
        locale={locale}
        data={data}
        disabled={!hasDb}
      />
    </Chrome>
  );
}
