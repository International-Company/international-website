import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { hasDb } from "@/lib/db";
import { getAnnouncement, getSiteConfig } from "@/lib/site-config";
import Chrome from "../_components/Chrome";
import { saveAnnounceAction } from "../actions";

export const dynamic = "force-dynamic";

const TONES = [
  ["gold", "ذهبي — عرض أو خبر"],
  ["info", "أزرق — معلومة عامة"],
  ["alert", "أحمر — تنبيه عاجل"],
] as const;

export default async function AdminSettingsPage() {
  if (!(await isAuthed())) redirect("/admin/login");

  const announce = await getAnnouncement();
  const site = await getSiteConfig();

  return (
    <Chrome
      active="/admin/settings"
      title="الإعدادات"
      subtitle="شريط الإعلانات وإعدادات الموقع العامة"
    >
      <section className="a-card">
        <div className="a-card-head">
          <div>
            <h2>شريط الإعلانات</h2>
            <div className="hint">
              شريط يظهر أعلى الصفحة في كل أنحاء الموقع — مناسب لإعلان عطلة أو عرض أو فرع جديد
            </div>
          </div>
        </div>

        <div className="a-card-body">
          <form action={saveAnnounceAction}>
            <label className="a-switch-row">
              <span className="a-toggle">
                <input type="checkbox" name="enabled" defaultChecked={announce.enabled} />
                <span className="track" />
              </span>
              <span>
                <b>إظهار الشريط في الموقع</b>
                <small>عند الإطفاء يختفي الشريط تماماً دون فقدان نصه</small>
              </span>
            </label>

            <div className="a-fieldgrid">
              <label className="a-field wide">
                <span className="a-field-label">النص بالعربية</span>
                <textarea
                  name="ar"
                  rows={2}
                  defaultValue={announce.ar}
                  dir="auto"
                  placeholder="مثال: الفروع مغلقة يوم الجمعة القادم بمناسبة العيد"
                />
              </label>

              <label className="a-field wide">
                <span className="a-field-label">النص بالإنجليزية</span>
                <textarea
                  name="en"
                  rows={2}
                  defaultValue={announce.en}
                  dir="ltr"
                  placeholder="Branches are closed next Friday for the holiday"
                />
                <small className="a-field-hint">
                  إذا تُرك فارغاً سيظهر النص العربي لزوار الصفحة الإنجليزية
                </small>
              </label>

              <label className="a-field">
                <span className="a-field-label">رابط عند الضغط (اختياري)</span>
                <input
                  name="href"
                  type="text"
                  defaultValue={announce.href}
                  dir="ltr"
                  placeholder="/ar/rates"
                />
                <small className="a-field-hint">
                  مسار داخل الموقع مثل ‎/ar/rates — اتركه فارغاً لشريط بلا رابط
                </small>
              </label>

              <label className="a-field">
                <span className="a-field-label">لون الشريط</span>
                <select name="tone" defaultValue={announce.tone}>
                  {TONES.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="a-savebar">
              <span className="tip">يظهر فوق القائمة العلوية في كل الصفحات</span>
              <button className="a-btn" type="submit" disabled={!hasDb}>
                حفظ الشريط
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="a-card">
        <div className="a-card-head">
          <div>
            <h2>إعدادات لا تُعدَّل من هنا</h2>
            <div className="hint">
              تُضبط من متغيرات البيئة في لوحة الاستضافة، لأنها تمسّ أمان الموقع
            </div>
          </div>
        </div>
        <div className="a-card-body">
          <ul className="a-kv">
            <li>
              <span className="k">رابط الموقع</span>
              <span className="v num" dir="ltr">
                {site.siteUrl}
              </span>
              <span className="note">NEXT_PUBLIC_SITE_URL</span>
            </li>
            <li>
              <span className="k">كلمة مرور اللوحة</span>
              <span className="v">••••••••</span>
              <span className="note">ADMIN_PASSWORD</span>
            </li>
            <li>
              <span className="k">مفتاح تشفير الجلسة</span>
              <span className="v">••••••••</span>
              <span className="note">AUTH_SECRET</span>
            </li>
            <li>
              <span className="k">قاعدة البيانات</span>
              <span className="v">{hasDb ? "متصلة" : "غير متصلة"}</span>
              <span className="note">DATABASE_URL</span>
            </li>
          </ul>
        </div>
      </section>
    </Chrome>
  );
}
