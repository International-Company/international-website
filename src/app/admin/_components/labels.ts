/** Arabic labels and formatters shared by every admin screen. */

export const STATUS_AR: Record<string, string> = {
  NEW: "جديد",
  IN_PROGRESS: "قيد التنفيذ",
  DONE: "منجز",
  CANCELLED: "ملغي",
};

export const SERVICE_AR: Record<string, string> = {
  remittances: "حوالة مالية",
  transfers: "تحويل دولي",
  exchange: "صرافة عملات",
  gold: "ذهب ومجوهرات",
};

const dateTime = new Intl.DateTimeFormat("ar", {
  dateStyle: "short",
  timeStyle: "short",
});

const dayMonth = new Intl.DateTimeFormat("ar", { day: "numeric", month: "short" });

export const arDateTime = (value: Date) => dateTime.format(value);
export const arDayMonth = (value: Date) => dayMonth.format(value);

/** Rate numbers keep Latin digits so they stay easy to compare at a glance. */
export const nf = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 3 });
