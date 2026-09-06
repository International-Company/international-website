import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthed } from "@/lib/auth";
import { hasDb } from "@/lib/db";
import { isLocale, type Locale } from "@/lib/i18n";
import { getContent } from "@/lib/content";
import { CONTENT_GROUPS, findGroup } from "@/lib/content-schema";
import { buildEditorData } from "@/lib/content-editor-data";
import Chrome from "../_components/Chrome";
import ContentEditor from "../_components/ContentEditor";
import { resetContentAction } from "../actions";

export const dynamic = "force-dynamic";

/** Groups that get their own screen rather than a tab here. */
const ELSEWHERE = new Set(["contact"]);

const EDITABLE = CONTENT_GROUPS.filter((g) => !ELSEWHERE.has(g.id));

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string; lang?: string }>;
}) {
  if (!(await isAuthed())) redirect("/admin/login");

  const sp = await searchParams;
  const group = (sp.group && findGroup(sp.group)) || EDITABLE[0];
  const locale: Locale = isLocale(sp.lang ?? "") ? (sp.lang as Locale) : "ar";

  const dict = await getContent(locale);
  const data = buildEditorData(group, dict);

  const href = (patch: { group?: string; lang?: string }) =>
    `/admin/content?group=${patch.group ?? group.id}&lang=${patch.lang ?? locale}`;

  return (
    <Chrome
      active="/admin/content"
      title="محتوى الموقع"
      subtitle="عدّل نصوص الموقع مباشرة — بالعربية والإنجليزية — دون لمس الكود"
      actions={
        <Link href={`/${locale}`} className="a-btn ghost sm" target="_blank">
          ↗ عرض الموقع
        </Link>
      }
    >
      <div className="a-langbar">
        <div className="a-langs">
          <Link href={href({ lang: "ar" })} className={locale === "ar" ? "on" : ""}>
            🇵🇸 العربية
          </Link>
          <Link href={href({ lang: "en" })} className={locale === "en" ? "on" : ""}>
            🇬🇧 English
          </Link>
        </div>
        <p className="a-langbar-hint">
          كل لغة تُحفظ على حدة — عدّل العربية ثم انتقل للإنجليزية.
        </p>
      </div>

      <nav className="a-groupnav">
        {EDITABLE.map((g) => (
          <Link key={g.id} href={href({ group: g.id })} className={g.id === group.id ? "on" : ""}>
            <span className="ico">{g.icon}</span>
            {g.label}
          </Link>
        ))}
      </nav>

      {group.hint && <div className="a-note">{group.hint}</div>}

      <ContentEditor
        key={`${group.id}:${locale}`}
        group={group}
        locale={locale}
        data={data}
        disabled={!hasDb}
      />

      <section className="a-card danger-zone">
        <div className="a-card-head">
          <div>
            <h2>استعادة النصوص الأصلية</h2>
            <div className="hint">
              يحذف كل تعديلات لغة {locale === "ar" ? "العربية" : "الإنجليزية"} ويعيد النصوص
              المكتوبة في الموقع أصلاً. لا يؤثر على اللغة الأخرى.
            </div>
          </div>
        </div>
        <div className="a-card-body">
          <form action={resetContentAction}>
            <input type="hidden" name="locale" value={locale} />
            <button className="a-btn danger sm" type="submit" disabled={!hasDb}>
              ↺ استعادة النصوص الأصلية
            </button>
          </form>
        </div>
      </section>
    </Chrome>
  );
}
