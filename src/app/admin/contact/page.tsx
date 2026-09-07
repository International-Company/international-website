import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthed } from "@/lib/auth";
import { hasDb } from "@/lib/db";
import { getSiteConfig } from "@/lib/site-config";
import {
  PLATFORMS,
  getDepartments,
  getSocialSettings,
} from "@/lib/contact-config";
import { getGallery } from "@/lib/gallery-config";
import { getImages } from "@/lib/media";
import { getContent } from "@/lib/content";
import { findGroup } from "@/lib/content-schema";
import { buildEditorData } from "@/lib/content-editor-data";
import Chrome from "../_components/Chrome";
import ContentEditor from "../_components/ContentEditor";
import DepartmentsEditor from "../_components/DepartmentsEditor";
import SocialIcon from "@/components/SocialIcon";
import { saveGalleryAction, saveSiteAction, saveSocialAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminContactPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  if (!(await isAuthed())) redirect("/admin/login");

  const { lang } = await searchParams;
  const locale = lang === "en" ? "en" : "ar";

  const site = await getSiteConfig();
  const social = await getSocialSettings();
  const departments = await getDepartments();
  const gallery = await getGallery();
  const images = await getImages();

  const headingGroup = findGroup("contact");
  const headingData = headingGroup
    ? buildEditorData(headingGroup, await getContent(locale))
    : null;

  const filled = PLATFORMS.filter((p) => (social[p.id] ?? "").trim()).length;

  return (
    <Chrome
      active="/admin/contact"
      title="تواصل معنا"
      subtitle="أرقام الأقسام وروابط التواصل الاجتماعي التي تظهر في صفحة «تواصل معنا»"
      actions={
        <Link href="/ar/contact" className="a-btn ghost sm" target="_blank">
          ↗ صفحة التواصل
        </Link>
      }
    >
      {/* ── main numbers, shared by every language ── */}
      <section className="a-card">
        <div className="a-card-head">
          <div>
            <h2>أرقام الشركة الرئيسية</h2>
            <div className="hint">
              تُستخدم في زر الواتساب العائم وأزرار الاتصال في كل صفحات الموقع
            </div>
          </div>
        </div>
        <div className="a-card-body">
          <form action={saveSiteAction}>
            <div className="a-fieldgrid">
              <label className="a-field">
                <span className="a-field-label">رقم الهاتف</span>
                <input name="phone" type="text" defaultValue={site.phone} dir="ltr" />
                <small className="a-field-hint">بصيغة دولية، مثل +970594020634</small>
              </label>

              <label className="a-field">
                <span className="a-field-label">رقم الواتساب</span>
                <input name="whatsapp" type="text" defaultValue={site.whatsapp} dir="ltr" />
                <small className="a-field-hint">أرقام فقط بدون + أو مسافات</small>
              </label>

              <label className="a-field">
                <span className="a-field-label">البريد الإلكتروني</span>
                <input name="email" type="email" defaultValue={site.email} dir="ltr" />
              </label>
            </div>

            <div className="a-savebar">
              <span className="tip">تُطبَّق فوراً على كل صفحات الموقع</span>
              <button className="a-btn" type="submit" disabled={!hasDb}>
                💾 حفظ الأرقام الرئيسية
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ── social profiles ── */}
      <section className="a-card">
        <div className="a-card-head">
          <div>
            <h2>روابط التواصل الاجتماعي</h2>
            <div className="hint">
              الصق رابط كل حساب — المنصات التي تتركها فارغة لا تظهر للزوار
            </div>
          </div>
          <span className="a-list-count">
            {filled} من {PLATFORMS.length}
          </span>
        </div>

        <div className="a-card-body">
          <form action={saveSocialAction}>
            <div className="a-social-list">
              {PLATFORMS.map((platform) => {
                const value = social[platform.id] ?? "";
                return (
                  <label className="a-social-row" key={platform.id}>
                    <span
                      className={`a-social-ic${value.trim() ? " on" : ""}`}
                      style={{ ["--brand" as string]: platform.color }}
                      aria-hidden
                    >
                      <SocialIcon id={platform.id} />
                    </span>
                    <span className="a-social-name">
                      <b>{platform.label}</b>
                      <small>{platform.labelEn}</small>
                    </span>
                    <input
                      name={`url_${platform.id}`}
                      type="text"
                      defaultValue={value}
                      dir="ltr"
                      placeholder={platform.placeholder}
                      aria-label={`رابط ${platform.label}`}
                    />
                  </label>
                );
              })}
            </div>

            <div className="a-savebar">
              <span className="tip">تظهر كأيقونات ملوّنة أسفل صفحة التواصل</span>
              <button className="a-btn" type="submit" disabled={!hasDb}>
                💾 حفظ الروابط
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ── per-department numbers ── */}
      <section className="a-card">
        <div className="a-card-head">
          <div>
            <h2>أرقام الأقسام</h2>
            <div className="hint">
              رقم مستقل لكل قسم — يظهر للزائر كبطاقة فيها زر اتصال وزر واتساب
            </div>
          </div>
        </div>
        <div className="a-card-body">
          <DepartmentsEditor departments={departments} disabled={!hasDb} />
        </div>
      </section>
      {/* ── the jewellery showroom ── */}
      <section className="a-card">
        <div className="a-card-head">
          <div>
            <h2>معرض المجوهرات</h2>
            <div className="hint">
              بطاقة بشعار المعرض ونبذة عنه ورابط إليه، تظهر أسفل بطاقات الأقسام
            </div>
          </div>
          <span className={`a-badge b-${gallery.enabled ? "DONE" : "CANCELLED"}`}>
            {gallery.enabled ? "ظاهر" : "مخفي"}
          </span>
        </div>

        <div className="a-card-body">
          <form action={saveGalleryAction}>
            <label className="a-switch-row">
              <span className="a-toggle">
                <input type="checkbox" name="enabled" defaultChecked={gallery.enabled} />
                <span className="track" />
              </span>
              <span>
                <b>إظهار بطاقة المعرض</b>
                <small>عند الإطفاء تختفي البطاقة دون فقدان بياناتها</small>
              </span>
            </label>

            <div className="a-gallery-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images["gallery-emblem"]} alt="" />
              <span>
                <b>الشعار المعروض</b>
                <small>
                  لتغييره: قسم <Link href="/admin/media">الصور</Link> ← «شعار معرض
                  المجوهرات»
                </small>
              </span>
            </div>

            <div className="a-fieldgrid">
              <label className="a-field wide">
                <span className="a-field-label">رابط المعرض</span>
                <input name="url" type="text" defaultValue={gallery.url} dir="ltr" />
                <small className="a-field-hint">
                  البطاقة لا تظهر بلا رابط صالح
                </small>
              </label>

              <label className="a-field">
                <span className="a-field-label">اسم المعرض بالعربية</span>
                <input name="nameAr" type="text" defaultValue={gallery.nameAr} dir="auto" />
              </label>
              <label className="a-field">
                <span className="a-field-label">اسم المعرض بالإنجليزية</span>
                <input name="nameEn" type="text" defaultValue={gallery.nameEn} dir="ltr" />
              </label>

              <label className="a-field">
                <span className="a-field-label">السطر تحت الاسم (عربي)</span>
                <input
                  name="taglineAr"
                  type="text"
                  defaultValue={gallery.taglineAr}
                  dir="auto"
                />
              </label>
              <label className="a-field">
                <span className="a-field-label">السطر تحت الاسم (إنجليزي)</span>
                <input
                  name="taglineEn"
                  type="text"
                  defaultValue={gallery.taglineEn}
                  dir="ltr"
                />
              </label>

              <label className="a-field wide">
                <span className="a-field-label">نبذة عن المعرض (عربي)</span>
                <textarea name="blurbAr" rows={3} defaultValue={gallery.blurbAr} dir="auto" />
              </label>
              <label className="a-field wide">
                <span className="a-field-label">نبذة عن المعرض (إنجليزي)</span>
                <textarea name="blurbEn" rows={3} defaultValue={gallery.blurbEn} dir="ltr" />
              </label>

              <label className="a-field">
                <span className="a-field-label">نص الزر (عربي)</span>
                <input name="ctaAr" type="text" defaultValue={gallery.ctaAr} dir="auto" />
              </label>
              <label className="a-field">
                <span className="a-field-label">نص الزر (إنجليزي)</span>
                <input name="ctaEn" type="text" defaultValue={gallery.ctaEn} dir="ltr" />
              </label>
            </div>

            <div className="a-savebar">
              <span className="tip">تظهر أسفل بطاقات الأقسام في صفحة التواصل</span>
              <button className="a-btn" type="submit" disabled={!hasDb}>
                💾 حفظ بطاقة المعرض
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ── the page's own heading ── */}
      {headingGroup && headingData && (
        <>
          <div className="a-langbar">
            <div className="a-langs">
              <Link href="/admin/contact?lang=ar" className={locale === "ar" ? "on" : ""}>
                🇵🇸 العربية
              </Link>
              <Link href="/admin/contact?lang=en" className={locale === "en" ? "on" : ""}>
                🇬🇧 English
              </Link>
            </div>
            <p className="a-langbar-hint">عنوان الصفحة يُكتب لكل لغة على حدة.</p>
          </div>

          <ContentEditor
            key={`contact:${locale}`}
            group={headingGroup}
            locale={locale}
            data={headingData}
            disabled={!hasDb}
          />
        </>
      )}
    </Chrome>
  );
}
