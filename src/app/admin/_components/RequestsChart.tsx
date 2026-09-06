import { arDayMonth } from "./labels";

/**
 * Daily request volume for the last two weeks.
 *
 * One measure, one hue — so there is no legend to read and no palette to get
 * wrong. Days with no requests keep their slot and show a baseline stub, which
 * distinguishes "nobody wrote in" from "no data". The plot runs left-to-right
 * even inside the RTL panel, the usual reading order for a time axis, and the
 * table underneath carries the same numbers for screen readers.
 */
export default function RequestsChart({
  series,
}: {
  /** Oldest first. `label` is an ISO date string. */
  series: { label: string; count: number }[];
}) {
  const peak = Math.max(0, ...series.map((s) => s.count));
  const total = series.reduce((sum, s) => sum + s.count, 0);
  // Guard the division only; `peak` itself stays truthful for the caption.
  const scale = peak || 1;
  // Only the busiest day gets a printed number; the rest are on hover.
  const peakIndex = peak > 0 ? series.findIndex((s) => s.count === peak) : -1;

  return (
    <figure className="a-chart">
      <figcaption className="a-chart-cap">
        <b className="num">{total}</b> طلب خلال آخر 14 يوماً
        {peak > 0 && (
          <span className="a-chart-peak"> · أعلى يوم {peak}</span>
        )}
      </figcaption>

      <div className="a-chart-plot" role="presentation">
        {series.map((point, i) => {
          const date = new Date(point.label);
          const height = point.count === 0 ? 0 : (point.count / scale) * 100;
          const day = arDayMonth(date);

          return (
            <div className="a-chart-col" key={point.label}>
              <div className="a-chart-track">
                {point.count > 0 && i === peakIndex && (
                  <span className="a-chart-value num" style={{ bottom: `${height}%` }}>
                    {point.count}
                  </span>
                )}
                <span
                  className={`a-chart-bar${point.count === 0 ? " zero" : ""}`}
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="a-chart-tip">
                {day} — {point.count} طلب
              </span>
              {/* Half the ticks, so 14 labels never collide on a phone. */}
              <span className={`a-chart-x${i % 2 ? " dim" : ""}`}>{i % 2 ? "" : day}</span>
            </div>
          );
        })}
      </div>

      <table className="a-visually-hidden">
        <caption>الطلبات اليومية خلال آخر 14 يوماً</caption>
        <thead>
          <tr>
            <th scope="col">اليوم</th>
            <th scope="col">عدد الطلبات</th>
          </tr>
        </thead>
        <tbody>
          {series.map((point) => (
            <tr key={point.label}>
              <th scope="row">{arDayMonth(new Date(point.label))}</th>
              <td>{point.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
