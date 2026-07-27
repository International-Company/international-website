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

const nf = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 3 });

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; status?: string }>;
}) {
  if (!(await isAuthed())) redirect("/admin/login");

  const { tab, status } = await searchParams;
  const active = tab === "requests" ? "requests" : "rates";

  const rates = await getAllRates();
  const requests = await safeDb(
    () => prisma.request.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    [] as Awaited<ReturnType<typeof prisma.request.findMany>>
  );

  const newCount = requests.filter((r) => r.status === "NEW").length;
  const activeRates = rates.filter((r) => r.active).length;
  const lastUpdate = rates.length
    ? rates.reduce<Date>((m, r) => (r.updatedAt > m ? r.updatedAt : m), rates[0].updatedAt)
    : null;
  const todayCount = requests.filter(
    (r) => new Date(r.createdAt).toDateString() === new Date().toDateString()
  ).length;

  const shown =
    status && status !== "ALL" ? requests.filter((r) => r.status === status) : requests;

  const currencies = rates.filter((r) => r.unit !== "gold");
  const golds = rates.filter((r) => r.unit === "gold");

  const nav = (
    <>
      <Link href="/admin" className={active === "rates" ? "on" : ""}>
        <span className="ico">💱</span> أسعار الشركة
      </Link>
      <Link href="/admin?tab=requests" className={active === "requests" ? "on" : ""}>
        <span className="ico">📋</span> الطلبات
        {newCount > 0 && <span className="pill">{newCount}</span>}
      </Link>
    </>
  );

  const RateRows = ({ rows }: { rows: typeof rates }) =>
    rows.map((r) => {
      const spread = r.sell - r.buy;
      return (
        <div className={`a-rate-row${r.active ? "" : " off"}`} key={r.code}>
          <input type="hidden" name="code" value={r.code} />
          <div className="a-rate-name">
            <span className={`a-rate-badge${r.unit === "gold" ? " g" : ""}`}>
              {r.unit === "gold" ? "◈" : r.code.slice(0, 2)}
            </span>
            <span style={{ minWidth: 0 }}>
              <b>{r.nameAr}</b>
              <small>{r.code}</small>
            </span>
          </div>
          <input
            className="a-inp buy"
            type="text"
            inputMode="decimal"
            lang="en"
            name={`buy_${r.code}`}
            defaultValue={r.buy}
            aria-label={`سعر شراء ${r.nameAr}`}
          />
          <input
            className="a-inp"
            type="text"
            inputMode="decimal"
            lang="en"
            name={`sell_${r.code}`}
            defaultValue={r.sell}
            aria-label={`سعر بيع ${r.nameAr}`}
          />
          <div className={`a-spread${spread < 0 ? " neg" : ""}`}>
            {spread >= 0 ? "+" : ""}
            {nf(spread)}
          </div>
          <div className="a-toggle-cell">
            <label className="a-toggle" title={r.active ? "ظاهر في الموقع" : "مخفي"}>
              <input
                type="checkbox"
                name={`active_${r.code}`}
                defaultChecked={r.active}
                aria-label={`إظهار ${r.nameAr}`}
              />
              <span className="track" />
            </label>
          </div>
        </div>
      );
    });

  return (
    <div className="a-shell">
      {/* ── Sidebar (desktop) ── */}
      <aside className="a-side">
        <div className="a-side-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="" />
          <div>
            <b>لوحة التحكم</b>
            <span>إنترنشونال</span>
          </div>
        </div>

        <nav className="a-nav">
          <div className="a-nav-label">الإدارة</div>
          {nav}
        </nav>

        <div className="a-side-foot">
          <Link href="/ar" className="a-btn ghost sm" target="_blank">
            ↗ عرض الموقع
          </Link>
          <form action={logoutAction}>
            <button className="a-btn ghost sm wide" type="submit">
              تسجيل الخروج
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="a-main">
        {/* mobile header */}
        <div className="a-mobile-head">
          <div className="brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="" />
            <div>
              <b>لوحة التحكم</b>
              <span>إنترنشونال</span>
            </div>
          </div>
          <form action={logoutAction}>
            <button className="a-btn ghost sm" type="submit">
              خروج
            </button>
          </form>
        </div>
        <nav className="a-mobile-nav">{nav}</nav>

        <div className="a-topbar">
          <div>
            <h1>{active === "rates" ? "أسعار الشركة" : "الطلبات الواردة"}</h1>
            <p>
              {active === "rates"
                ? "الأسعار التي تظهر لعملائك في الصفحة الرئيسية وصفحة الأسعار"
                : "طلبات الخدمة الواردة من الموقع"}
            </p>
          </div>
          <div className="a-topbar-actions">
            <Link href="/ar/rates" className="a-btn ghost sm" target="_blank">
              ↗ صفحة الأسعار
            </Link>
          </div>
        </div>

        {/* stats */}
        <div className="a-stats">
          <div className="a-stat">
            <div className="lbl">💱 بنود مفعّلة</div>
            <div className="val num">
              {activeRates}
              <span style={{ fontSize: 15, color: "var(--ink-3)" }}> / {rates.length}</span>
            </div>
            <div className="sub">تظهر للعملاء</div>
          </div>
          <div className={`a-stat${newCount > 0 ? " warn" : " ok"}`}>
            <div className="lbl">📋 طلبات جديدة</div>
            <div className="val num">{newCount}</div>
            <div className="sub">بانتظار المتابعة</div>
          </div>
          <div className="a-stat ok">
            <div className="lbl">📅 طلبات اليوم</div>
            <div className="val num">{todayCount}</div>
            <div className="sub">خلال 24 ساعة</div>
          </div>
          <div className="a-stat gold">
            <div className="lbl">🕒 آخر تحديث للأسعار</div>
            <div className="val" style={{ fontSize: 17 }}>
              {lastUpdate
                ? new Intl.DateTimeFormat("ar", { dateStyle: "short", timeStyle: "short" }).format(
                    lastUpdate
                  )
                : "—"}
            </div>
            <div className="sub">{lastUpdate ? "محدّثة" : "لم تُحدّث بعد"}</div>
          </div>
        </div>

        {!hasDb && (
          <div className="a-error">
            قاعدة البيانات غير متصلة. أضف متغير <code>DATABASE_URL</code> في إعدادات Railway
            لتفعيل الحفظ.
          </div>
        )}

        {active === "rates" ? (
          <section className="a-card">
            <div className="a-card-head">
              <div>
                <h2>تعديل الأسعار</h2>
                <div className="hint">
                  العملات مقابل الشيكل ₪ · الذهب سعر الغرام بالشيكل ₪
                </div>
              </div>
            </div>

            <div className="a-card-body">
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
                    <span className="big">🗄</span>
                    أضف قاعدة بيانات PostgreSQL في Railway لتفعيل تعديل الأسعار.
                  </div>
                )
              ) : (
                <form action={saveRatesAction}>
                  <div className="a-rate-row head">
                    <span>البند</span>
                    <span>شراء</span>
                    <span>بيع</span>
                    <span>الهامش</span>
                    <span>إظهار</span>
                  </div>

                  {currencies.length > 0 && (
                    <>
                      <div className="a-group-title">💱 العملات</div>
                      <RateRows rows={currencies} />
                    </>
                  )}
                  {golds.length > 0 && (
                    <>
                      <div className="a-group-title">◈ الذهب</div>
                      <RateRows rows={golds} />
                    </>
                  )}

                  <div className="a-savebar">
                    <span className="tip">التغييرات تظهر في الموقع فور الحفظ</span>
                    <button className="a-btn" type="submit">
                      💾 حفظ الأسعار
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        ) : (
          <section className="a-card">
            <div className="a-card-head">
              <div>
                <h2>الطلبات</h2>
                <div className="hint">آخر 100 طلب — {shown.length} معروض</div>
              </div>
              <div className="a-filters">
                {[
                  ["ALL", "الكل"],
                  ["NEW", "جديد"],
                  ["IN_PROGRESS", "قيد التنفيذ"],
                  ["DONE", "منجز"],
                ].map(([k, label]) => (
                  <Link
                    key={k}
                    href={`/admin?tab=requests${k === "ALL" ? "" : `&status=${k}`}`}
                    className={(status ?? "ALL") === k ? "on" : ""}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="a-card-body">
              {shown.length === 0 ? (
                <div className="a-empty">
                  <span className="big">📭</span>
                  لا توجد طلبات في هذا التصنيف.
                </div>
              ) : (
                shown.map((q) => (
                  <article className={`a-req${q.status === "NEW" ? " is-new" : ""}`} key={q.id}>
                    <div className="a-req-top">
                      <div className="a-req-who">
                        <span className="a-avatar">{q.name.trim().charAt(0) || "؟"}</span>
                        <span style={{ minWidth: 0 }}>
                          <b>{q.name}</b>
                          <span>{SERVICE_AR[q.service] ?? q.service}</span>
                        </span>
                      </div>
                      <span className={`a-badge b-${q.status}`}>{STATUS_AR[q.status]}</span>
                    </div>

                    <div className="a-req-grid">
                      <div>
                        <span className="k">الهاتف</span>
                        <span className="v num" dir="ltr">
                          {q.phone}
                        </span>
                      </div>
                      {q.amount && (
                        <div>
                          <span className="k">المبلغ</span>
                          <span className="v num">
                            {q.amount} {q.currency ?? ""}
                          </span>
                        </div>
                      )}
                      {q.country && (
                        <div>
                          <span className="k">الوجهة</span>
                          <span className="v">{q.country}</span>
                        </div>
                      )}
                      {q.recipient && (
                        <div>
                          <span className="k">المستلم</span>
                          <span className="v">{q.recipient}</span>
                        </div>
                      )}
                      <div>
                        <span className="k">التاريخ</span>
                        <span className="v">
                          {new Intl.DateTimeFormat("ar", {
                            dateStyle: "short",
                            timeStyle: "short",
                          }).format(q.createdAt)}
                        </span>
                      </div>
                    </div>

                    {q.note && <p className="a-req-note">{q.note}</p>}

                    <div className="a-req-actions">
                      <a
                        className="a-btn wa sm"
                        href={`https://wa.me/${q.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        ✆ واتساب
                      </a>
                      <a className="a-btn ghost sm" href={`tel:${q.phone.replace(/\s/g, "")}`}>
                        اتصال
                      </a>
                      <span className="spacer" />
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
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
