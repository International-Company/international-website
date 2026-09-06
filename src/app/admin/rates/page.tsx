import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthed } from "@/lib/auth";
import { hasDb } from "@/lib/db";
import { getAllRates } from "@/lib/rates-service";
import Chrome from "../_components/Chrome";
import { nf } from "../_components/labels";
import { saveRatesAction, seedRatesAction } from "../actions";

export const dynamic = "force-dynamic";

type Rate = Awaited<ReturnType<typeof getAllRates>>[number];

function RateRows({ rows }: { rows: Rate[] }) {
  return (
    <>
      {rows.map((r) => {
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
      })}
    </>
  );
}

export default async function AdminRatesPage() {
  if (!(await isAuthed())) redirect("/admin/login");

  const rates = await getAllRates();
  const currencies = rates.filter((r) => r.unit !== "gold");
  const golds = rates.filter((r) => r.unit === "gold");

  return (
    <Chrome
      active="/admin/rates"
      title="أسعار الشركة"
      subtitle="الأسعار التي تظهر لعملائك في الصفحة الرئيسية وصفحة الأسعار"
      actions={
        <Link href="/ar/rates" className="a-btn ghost sm" target="_blank">
          ↗ صفحة الأسعار
        </Link>
      }
    >
      <section className="a-card">
        <div className="a-card-head">
          <div>
            <h2>تعديل الأسعار</h2>
            <div className="hint">
              العملات مقابل الشيكل ₪ · الذهب سعر الغرام بالدينار الأردني
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
                أضف قاعدة بيانات PostgreSQL لتفعيل تعديل الأسعار.
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

              <div className="a-savebar sticky">
                <span className="tip">التغييرات تظهر في الموقع فور الحفظ</span>
                <button className="a-btn" type="submit">
                  💾 حفظ الأسعار
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </Chrome>
  );
}
