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
import Chrome from "../_components/Chrome";
import DepartmentsEditor from "../_components/DepartmentsEditor";
import SocialIcon from "@/components/SocialIcon";
import { saveSiteAction, saveSocialAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminContactPage() {
  if (!(await isAuthed())) redirect("/admin/login");

  const site = await getSiteConfig();
  const social = await getSocialSettings();
  const departments = await getDepartments();

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

              <label className="a-field">
                <span className="a-field-label">معرّف FormSubmit</span>
                <input
                  name="formsubmitId"
                  type="text"
                  defaultValue={site.formsubmitId}
                  dir="ltr"
                />
                <small className="a-field-hint">
                  يستقبل رسائل نموذج التواصل — لا تغيّره إلا إذا تغيّر بريد الشركة
                </small>
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
    </Chrome>
  );
}
