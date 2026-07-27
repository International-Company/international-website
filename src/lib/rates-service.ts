import { prisma, safeDb } from "./db";
import { DEFAULT_RATES, type CompanyRate } from "./rates-data";

/** Company buy/sell rates for the public site — falls back to defaults. */
export async function getCompanyRates(): Promise<{
  rates: CompanyRate[];
  updatedAt: Date | null;
  live: boolean;
}> {
  const rows = await safeDb(
    () => prisma.rate.findMany({ where: { active: true }, orderBy: { sort: "asc" } }),
    [] as Awaited<ReturnType<typeof prisma.rate.findMany>>
  );

  if (!rows.length) {
    return { rates: DEFAULT_RATES, updatedAt: null, live: false };
  }

  const updatedAt = rows.reduce<Date>(
    (max, r) => (r.updatedAt > max ? r.updatedAt : max),
    rows[0].updatedAt
  );

  return {
    rates: rows.map((r) => ({
      code: r.code,
      nameAr: r.nameAr,
      nameEn: r.nameEn,
      buy: r.buy,
      sell: r.sell,
      unit: r.unit === "gold" ? "gold" : "currency",
      sort: r.sort,
      active: r.active,
    })),
    updatedAt,
    live: true,
  };
}

/** All rates including inactive ones — admin view. */
export async function getAllRates() {
  return safeDb(
    () => prisma.rate.findMany({ orderBy: { sort: "asc" } }),
    [] as Awaited<ReturnType<typeof prisma.rate.findMany>>
  );
}
