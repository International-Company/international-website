import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthed } from "@/lib/auth";
import { prisma, safeDb } from "@/lib/db";
import { getAllRates } from "@/lib/rates-service";
import { getAnnouncement } from "@/lib/site-config";
import Chrome from "./_components/Chrome";
import RequestsChart from "./_components/RequestsChart";
import { SERVICE_AR, STATUS_AR, arDateTime } from "./_components/labels";

export const dynamic = "force-dynamic";

/** Midnight `days` ago, so "today" is a full calendar day rather than 24h. */
function startOfDayAgo(days: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
}

export default async function AdminOverviewPage() {
  if (!(await isAuthed())) redirect("/admin/login");

  const rates = await getAllRates();
  const announce = await getAnnouncement();

  const since = startOfDayAgo(13);
  const recent = await safeDb(
    () =>
      prisma.request.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true, status: true, service: true },
      }),
    [] as { createdAt: Date; status: string; service: string }[]
  );

  const latest = await safeDb(
    () => prisma.request.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    [] as Awaited<ReturnType<typeof prisma.request.findMany>>
  );

  const newCount = await safeDb(
    () => prisma.request.count({ where: { status: "NEW" } }),
    0
  );
  const totalCount = await safeDb(() => prisma.request.count(), 0);

  const today = startOfDayAgo(0);
  const todayCount = recent.filter((r) => r.createdAt >= today).length;

  const activeRates = rates.filter((r) => r.active).length;
  const lastUpdate = rates.length
    ? rates.reduce<Date>((m, r) => (r.updatedAt > m ? r.updatedAt : m), rates[0].updatedAt)
    : null;

  // Requests per day for the last 14 days, oldest first.
  const series = Array.from({ length: 14 }, (_, i) => {
    const day = startOfDayAgo(13 - i);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    return {
      day,
      count: recent.filter((r) => r.createdAt >= day && r.createdAt < next).length,
    };
  });

  // Which services people actually ask for, over the same window.
  const byService = Object.entries(
    recent.reduce<Record<string, number>>((acc, r) => {
      acc[r.service] = (acc[r.service] ?? 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);
  const serviceTotal = byService.reduce((sum, [, n]) => sum + n, 0);

  return (
    <Chrome
      active="/admin"
      title="نظرة عامة"
      subtitle="ملخّص حالة الموقع والطلبات الواردة"
      actions={
        <Link href="/ar" className="a-btn ghost sm" target="_blank">
          ↗ عرض الموقع
        </Link>
      }
    >
      <div className="a-stats">
        <div className={`a-stat${newCount > 0 ? " warn" : " ok"}`}>
          <div className="lbl">📋 طلبات جديدة</div>
          <div className="val num">{newCount}</div>
          <div className="sub">بانتظار المتابعة</div>
        </div>
        <div className="a-stat ok">
          <div className="lbl">📅 طلبات اليوم</div>
          <div className="val num">{todayCount}</div>
          <div className="sub">منذ منتصف الليل</div>
        </div>
        <div className="a-stat">
          <div className="lbl">💱 بنود مفعّلة</div>
          <div className="val num">
            {activeRates}
            <span style={{ fontSize: 15, color: "var(--ink-3)" }}> / {rates.length}</span>
          </div>
          <div className="sub">تظهر للعملاء</div>
        </div>
        <div className="a-stat gold">
          <div className="lbl">🕒 آخر تحديث للأسعار</div>
          <div className="val" style={{ fontSize: 17 }}>
            {lastUpdate ? arDateTime(lastUpdate) : "—"}
          </div>
          <div className="sub">{lastUpdate ? "محدّثة" : "لم تُحدّث بعد"}</div>
        </div>
      </div>

      {announce.enabled && (
        <div className="a-note">
          🔔 شريط الإعلانات مفعّل حالياً: «{announce.ar || announce.en}» —{" "}
          <Link href="/admin/settings">تعديله</Link>
        </div>
      )}

      <div className="a-two">
        <section className="a-card">
          <div className="a-card-head">
            <div>
              <h2>الطلبات خلال أسبوعين</h2>
              <div className="hint">إجمالي {totalCount} طلب منذ البداية</div>
            </div>
          </div>
          <div className="a-card-body">
            <RequestsChart series={series.map((s) => ({ label: s.day.toISOString(), count: s.count }))} />
          </div>
        </section>

        <section className="a-card">
          <div className="a-card-head">
            <div>
              <h2>الخدمات الأكثر طلباً</h2>
              <div className="hint">آخر 14 يوماً</div>
            </div>
          </div>
          <div className="a-card-body">
            {byService.length === 0 ? (
              <div className="a-empty">
                <span className="big">📭</span>
                لا توجد طلبات في هذه الفترة.
              </div>
            ) : (
              <ul className="a-breakdown">
                {byService.map(([service, count]) => (
                  <li key={service}>
                    <span className="k">{SERVICE_AR[service] ?? service}</span>
                    <span className="bar">
                      <span
                        style={{ width: `${Math.round((count / serviceTotal) * 100)}%` }}
                      />
                    </span>
                    <span className="v num">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <section className="a-card">
        <div className="a-card-head">
          <div>
            <h2>أحدث الطلبات</h2>
            <div className="hint">آخر 6 طلبات واردة</div>
          </div>
          <div className="a-filters">
            <Link href="/admin/requests" className="on">
              كل الطلبات
            </Link>
          </div>
        </div>
        <div className="a-card-body">
          {latest.length === 0 ? (
            <div className="a-empty">
              <span className="big">📭</span>
              لم تصل أي طلبات بعد.
            </div>
          ) : (
            <ul className="a-mini-list">
              {latest.map((q) => (
                <li key={q.id}>
                  <span className="a-avatar">{q.name.trim().charAt(0) || "؟"}</span>
                  <span className="who">
                    <b>{q.name}</b>
                    <small>{SERVICE_AR[q.service] ?? q.service}</small>
                  </span>
                  <span className="num" dir="ltr">
                    {q.phone}
                  </span>
                  <span className={`a-badge b-${q.status}`}>{STATUS_AR[q.status]}</span>
                  <span className="when">{arDateTime(q.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </Chrome>
  );
}
