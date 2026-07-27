import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthed } from "@/lib/auth";
import { prisma, safeDb, hasDb } from "@/lib/db";
import { getAllRates } from "@/lib/rates-service";
import {
  logoutAction,
  saveRatesAction,
  seedRatesAction,
  setRequestStatusAction,
  deleteRequestAction,
} from "./actions";

export const dynamic = "force-dynamic";

const STATUS_AR: Record<string, string> = {
  NEW: "جديد",
  IN_PROGRESS: "قيد التنفيذ",
  DONE: "منجز",
  CANCELLED: "ملغي",
};

const SERVICE_AR: Record<string, string> = {
  remittances: "حوالة مالية",
  transfers: "تحويل دولي",
  exchange: "صرافة عملات",
  gold: "ذهب ومجوهرات",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  if (!(await isAuthed())) redirect("/admin/login");

  const { tab } = await searchParams;
  const active = tab === "requests" ? "requests" : "rates";

  const rates = await getAllRates();
  const requests = await safeDb(
    () => prisma.request.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    [] as Awaited<ReturnType<typeof prisma.request.findMany>>
  );
  const newCount = requests.filter((r) => r.status === "NEW").length;

  return (
    <div className="a-wrap">
      <header className="a-head">
        <div className="a-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="" />
          <div>
            <b>لوحة التحكم</b>
            <span>إنترنشونال للخدمات المالية والمجوهرات</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/ar" className="a-btn ghost sm" target="_blank">
            عرض الموقع ↗
          </Link>
          <form action={logoutAction}>
            <button className="a-btn ghost sm" type="submit">
              خروج
            </button>
          </form>
        </div>
      </header>

      <nav className="a-tabs">
        <Link href="/admin" className={active === "rates" ? "on" : ""}>
          أسعار الشركة
        </Link>
        <Link href="/admin?tab=requests" className={active === "requests" ? "on" : ""}>
          الطلبات
          {newCount > 0 && <span className="count">{newCount}</span>}
        </Link>
      </nav>

      {!hasDb && (
        <div className="a-error">
          قاعدة البيانات غير متصلة. أضف متغير <code>DATABASE_URL</code> في إعدادات Railway
          لتفعيل الحفظ.
        </div>
      )}

      {active === "rates" ? (
        <section className="a-card">
          <h2>أسعار الشركة</h2>
          <p className="hint">
            عدّل أسعار الشراء والبيع ثم اضغط حفظ — ستظهر مباشرة في صفحة الأسعار على الموقع.
            (العملات مقابل الشيكل ₪ · الذهب سعر الغرام بالشيكل)
          </p>

          {rates.length === 0 ? (
            hasDb ? (
              <>
                <div className="a-note">
                  لم تُنشأ قائمة الأسعار بعد. اضغط الزر لإنشاء القائمة الافتراضية ثم عدّلها.
                </div>
                <form action={seedRatesAction}>
                  <button className="a-btn" type="submit">
                    إنشاء قائمة الأسعار
                  </button>
                </form>
              </>
            ) : (
              <div className="a-empty">
                أضف قاعدة بيانات PostgreSQL في Railway لتفعيل تعديل الأسعار.
              </div>
            )
          ) : (
            <form action={saveRatesAction}>
              <div className="a-rate-row head">
                <div>العملة</div>
                <div style={{ textAlign: "center" }}>شراء</div>
                <div style={{ textAlign: "center" }}>بيع</div>
                <div style={{ textAlign: "center" }}>مفعّل</div>
              </div>

              {rates.map((r) => (
                <div className="a-rate-row" key={r.code}>
                  <input type="hidden" name="code" value={r.code} />
                  <div className="a-rate-name">
                    <b>{r.nameAr}</b>
                    <span>{r.code}</span>
                  </div>
                  <input
                    type="number"
                    step="0.001"
                    name={`buy_${r.code}`}
                    defaultValue={r.buy}
                    aria-label={`سعر شراء ${r.nameAr}`}
                  />
                  <input
                    type="number"
                    step="0.001"
                    name={`sell_${r.code}`}
                    defaultValue={r.sell}
                    aria-label={`سعر بيع ${r.nameAr}`}
                  />
                  <div className="a-switch">
                    <input
                      type="checkbox"
                      name={`active_${r.code}`}
                      defaultChecked={r.active}
                      aria-label={`تفعيل ${r.nameAr}`}
                    />
                  </div>
                </div>
              ))}

              <div className="a-sticky-save">
                <button className="a-btn wide" type="submit">
                  حفظ الأسعار
                </button>
              </div>
            </form>
          )}
        </section>
      ) : (
        <section className="a-card">
          <h2>الطلبات الواردة</h2>
          <p className="hint">آخر 100 طلب من نموذج طلب الخدمة في الموقع.</p>

          {requests.length === 0 ? (
            <div className="a-empty">لا توجد طلبات بعد.</div>
          ) : (
            requests.map((q) => (
              <article className="a-req" key={q.id}>
                <div className="a-req-top">
                  <b>
                    {q.name} — {SERVICE_AR[q.service] ?? q.service}
                  </b>
                  <span className={`a-badge b-${q.status}`}>{STATUS_AR[q.status]}</span>
                </div>

                <div className="a-req-grid">
                  <div>
                    الهاتف: <b dir="ltr">{q.phone}</b>
                  </div>
                  {q.amount && (
                    <div>
                      المبلغ: <b>{q.amount} {q.currency ?? ""}</b>
                    </div>
                  )}
                  {q.country && (
                    <div>
                      الوجهة: <b>{q.country}</b>
                    </div>
                  )}
                  {q.recipient && (
                    <div>
                      المستلم: <b>{q.recipient}</b>
                    </div>
                  )}
                  <div>
                    التاريخ:{" "}
                    <b>
                      {new Intl.DateTimeFormat("ar", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(q.createdAt)}
                    </b>
                  </div>
                </div>

                {q.note && (
                  <p style={{ fontSize: 13.5, color: "var(--ink-2)", marginBottom: 12 }}>
                    ملاحظة: {q.note}
                  </p>
                )}

                <div className="a-req-actions">
                  <a
                    className="a-btn sm"
                    href={`https://wa.me/${q.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    واتساب
                  </a>
                  {(["IN_PROGRESS", "DONE", "CANCELLED"] as const)
                    .filter((s) => s !== q.status)
                    .map((s) => (
                      <form action={setRequestStatusAction} key={s}>
                        <input type="hidden" name="id" value={q.id} />
                        <input type="hidden" name="status" value={s} />
                        <button className="a-btn ghost sm" type="submit">
                          {STATUS_AR[s]}
                        </button>
                      </form>
                    ))}
                  <form action={deleteRequestAction}>
                    <input type="hidden" name="id" value={q.id} />
                    <button className="a-btn danger sm" type="submit">
                      حذف
                    </button>
                  </form>
                </div>
              </article>
            ))
          )}
        </section>
      )}
    </div>
  );
}
