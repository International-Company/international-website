import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthed } from "@/lib/auth";
import { prisma, safeDb } from "@/lib/db";
import type { Prisma } from "@/generated/prisma";
import Chrome from "../_components/Chrome";
import { SERVICE_AR, STATUS_AR, arDateTime } from "../_components/labels";
import {
  clearFinishedRequestsAction,
  deleteRequestAction,
  setRequestStatusAction,
} from "../actions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

const STATUS_TABS = [
  ["ALL", "الكل"],
  ["NEW", "جديد"],
  ["IN_PROGRESS", "قيد التنفيذ"],
  ["DONE", "منجز"],
  ["CANCELLED", "ملغي"],
] as const;

const VALID_STATUS = new Set(["NEW", "IN_PROGRESS", "DONE", "CANCELLED"]);

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; service?: string; page?: string }>;
}) {
  if (!(await isAuthed())) redirect("/admin/login");

  const sp = await searchParams;
  const status = sp.status && VALID_STATUS.has(sp.status) ? sp.status : "ALL";
  const service = sp.service && SERVICE_AR[sp.service] ? sp.service : "";
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.RequestWhereInput = {
    ...(status !== "ALL" ? { status: status as Prisma.EnumRequestStatusFilter["equals"] } : {}),
    ...(service ? { service } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { phone: { contains: q } },
            { recipient: { contains: q, mode: "insensitive" as const } },
            { country: { contains: q, mode: "insensitive" as const } },
            { note: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const total = await safeDb(() => prisma.request.count({ where }), 0);
  const shown = await safeDb(
    () =>
      prisma.request.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    [] as Awaited<ReturnType<typeof prisma.request.findMany>>
  );

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filtering = status !== "ALL" || Boolean(service) || Boolean(q);

  /** Keeps the current filters while changing one of them. */
  const linkTo = (patch: Record<string, string>) => {
    const params = new URLSearchParams();
    const merged = { status, service, q, page: "1", ...patch };
    for (const [key, value] of Object.entries(merged)) {
      if (value && !(key === "status" && value === "ALL") && !(key === "page" && value === "1")) {
        params.set(key, value);
      }
    }
    const qs = params.toString();
    return `/admin/requests${qs ? `?${qs}` : ""}`;
  };

  const exportParams = new URLSearchParams();
  if (status !== "ALL") exportParams.set("status", status);
  if (service) exportParams.set("service", service);
  if (q) exportParams.set("q", q);

  return (
    <Chrome
      active="/admin/requests"
      title="الطلبات الواردة"
      subtitle="طلبات الخدمة التي أرسلها العملاء من الموقع"
      actions={
        <>
          <a
            className="a-btn ghost sm"
            href={`/admin/requests/export?${exportParams.toString()}`}
          >
            ⬇ تصدير CSV
          </a>
          <form action={clearFinishedRequestsAction}>
            <button className="a-btn ghost sm" type="submit">
              🧹 مسح المنجز والملغي
            </button>
          </form>
        </>
      }
    >
      <section className="a-card">
        <div className="a-card-head">
          <div>
            <h2>الطلبات</h2>
            <div className="hint">
              {total} طلب{filtering ? " مطابق للفلتر" : ""} · صفحة {page} من {pages}
            </div>
          </div>
        </div>

        <div className="a-card-body">
          <form className="a-search" method="get">
            {status !== "ALL" && <input type="hidden" name="status" value={status} />}
            {service && <input type="hidden" name="service" value={service} />}
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="ابحث بالاسم أو الهاتف أو الوجهة..."
              aria-label="بحث في الطلبات"
            />
            <button className="a-btn sm" type="submit">
              بحث
            </button>
            {filtering && (
              <Link className="a-btn ghost sm" href="/admin/requests">
                مسح الفلاتر
              </Link>
            )}
          </form>

          <div className="a-filters">
            {STATUS_TABS.map(([key, label]) => (
              <Link
                key={key}
                href={linkTo({ status: key })}
                className={status === key ? "on" : ""}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="a-filters soft">
            <Link href={linkTo({ service: "" })} className={service ? "" : "on"}>
              كل الخدمات
            </Link>
            {Object.entries(SERVICE_AR).map(([key, label]) => (
              <Link
                key={key}
                href={linkTo({ service: key })}
                className={service === key ? "on" : ""}
              >
                {label}
              </Link>
            ))}
          </div>

          {shown.length === 0 ? (
            <div className="a-empty">
              <span className="big">📭</span>
              {filtering ? "لا توجد طلبات مطابقة لهذا البحث." : "لم تصل أي طلبات بعد."}
            </div>
          ) : (
            shown.map((q2) => (
              <article className={`a-req${q2.status === "NEW" ? " is-new" : ""}`} key={q2.id}>
                <div className="a-req-top">
                  <div className="a-req-who">
                    <span className="a-avatar">{q2.name.trim().charAt(0) || "؟"}</span>
                    <span style={{ minWidth: 0 }}>
                      <b>{q2.name}</b>
                      <span>{SERVICE_AR[q2.service] ?? q2.service}</span>
                    </span>
                  </div>
                  <span className={`a-badge b-${q2.status}`}>{STATUS_AR[q2.status]}</span>
                </div>

                <div className="a-req-grid">
                  <div>
                    <span className="k">الهاتف</span>
                    <span className="v num" dir="ltr">
                      {q2.phone}
                    </span>
                  </div>
                  {q2.amount && (
                    <div>
                      <span className="k">المبلغ</span>
                      <span className="v num">
                        {q2.amount} {q2.currency ?? ""}
                      </span>
                    </div>
                  )}
                  {q2.country && (
                    <div>
                      <span className="k">الوجهة</span>
                      <span className="v">{q2.country}</span>
                    </div>
                  )}
                  {q2.recipient && (
                    <div>
                      <span className="k">المستلم</span>
                      <span className="v">{q2.recipient}</span>
                    </div>
                  )}
                  <div>
                    <span className="k">التاريخ</span>
                    <span className="v">{arDateTime(q2.createdAt)}</span>
                  </div>
                </div>

                {q2.note && <p className="a-req-note">{q2.note}</p>}

                <div className="a-req-actions">
                  <a
                    className="a-btn wa sm"
                    href={`https://wa.me/${q2.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ✆ واتساب
                  </a>
                  <a className="a-btn ghost sm" href={`tel:${q2.phone.replace(/\s/g, "")}`}>
                    اتصال
                  </a>
                  <span className="spacer" />
                  {(["IN_PROGRESS", "DONE", "CANCELLED"] as const)
                    .filter((s) => s !== q2.status)
                    .map((s) => (
                      <form action={setRequestStatusAction} key={s}>
                        <input type="hidden" name="id" value={q2.id} />
                        <input type="hidden" name="status" value={s} />
                        <button className="a-btn ghost sm" type="submit">
                          {STATUS_AR[s]}
                        </button>
                      </form>
                    ))}
                  <form action={deleteRequestAction}>
                    <input type="hidden" name="id" value={q2.id} />
                    <button className="a-btn danger sm" type="submit">
                      حذف
                    </button>
                  </form>
                </div>
              </article>
            ))
          )}

          {pages > 1 && (
            <div className="a-pager">
              <Link
                className={`a-btn ghost sm${page <= 1 ? " is-disabled" : ""}`}
                href={linkTo({ page: String(page - 1) })}
              >
                → السابق
              </Link>
              <span className="a-pager-now num">
                {page} / {pages}
              </span>
              <Link
                className={`a-btn ghost sm${page >= pages ? " is-disabled" : ""}`}
                href={linkTo({ page: String(page + 1) })}
              >
                التالي ←
              </Link>
            </div>
          )}
        </div>
      </section>
    </Chrome>
  );
}
