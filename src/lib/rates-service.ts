import { prisma, safeDb } from "./db";
import { DEFAULT_RATES, type CompanyRate } from "./rates-data";

export type { CompanyRate };

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

/**
 * Converts company buy/sell rates (quoted against ILS) into the per-USD map the
 * converter uses, so the homepage calculator reflects the company's own prices.
 * Falls back to the global market map for currencies the company hasn't set.
 */
export function mergeCompanyIntoFx(
  fx: Record<string, number>,
  company: CompanyRate[]
): Record<string, number> {
  const usd = company.find((r) => r.code === "USD" && r.unit === "currency");
  if (!usd) return fx;

  // mid-market style reference so buying and selling stay symmetrical
  const ilsPerUsd = (usd.buy + usd.sell) / 2;
  if (!Number.isFinite(ilsPerUsd) || ilsPerUsd <= 0) return fx;

  const merged: Record<string, number> = { ...fx, USD: 1, ILS: ilsPerUsd };

  for (const r of company) {
    if (r.unit !== "currency" || r.code === "USD" || r.code === "ILS") continue;
    const ilsPerUnit = (r.buy + r.sell) / 2;
    if (!Number.isFinite(ilsPerUnit) || ilsPerUnit <= 0) continue;
    // units of this currency per 1 USD
    merged[r.code] = ilsPerUsd / ilsPerUnit;
  }

  return merged;
}

/** All rates including inactive ones — admin view. */
export async function getAllRates() {
  return safeDb(
    () => prisma.rate.findMany({ orderBy: { sort: "asc" } }),
    [] as Awaited<ReturnType<typeof prisma.rate.findMany>>
  );
}
