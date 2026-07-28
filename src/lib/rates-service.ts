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
/** A currency the converter can use, always quoted in ILS per 1 unit. */
export type ConverterRate = {
  code: string;
  nameAr: string;
  nameEn: string;
  /** ILS the shop pays when buying this currency from the customer. */
  buy: number;
  /** ILS the shop charges when selling this currency to the customer. */
  sell: number;
};

const MARKET_CODES = ["USD", "JOD", "EUR", "GBP", "EGP", "SAR", "AED", "TRY"];

const MARKET_NAMES: Record<string, { ar: string; en: string }> = {
  USD: { ar: "دولار أمريكي", en: "US Dollar" },
  JOD: { ar: "دينار أردني", en: "Jordanian Dinar" },
  EUR: { ar: "يورو", en: "Euro" },
  GBP: { ar: "جنيه إسترليني", en: "British Pound" },
  EGP: { ar: "جنيه مصري", en: "Egyptian Pound" },
  SAR: { ar: "ريال سعودي", en: "Saudi Riyal" },
  AED: { ar: "درهم إماراتي", en: "UAE Dirham" },
  TRY: { ar: "ليرة تركية", en: "Turkish Lira" },
};

const SHEKEL: ConverterRate = {
  code: "ILS",
  nameAr: "شيكل",
  nameEn: "Shekel",
  buy: 1,
  sell: 1,
};

/**
 * Currencies for the public converter.
 *
 * Prefers the shop's own buy/sell board so the customer sees exactly what they
 * would receive at the counter; falls back to global market rates (buy = sell)
 * when the shop has not published its board yet.
 */
export async function getConverterRates(
  fx: Record<string, number>
): Promise<{ rates: ConverterRate[]; source: "shop" | "market" }> {
  const { rates: company, live } = await getCompanyRates();

  if (live) {
    const shop = company
      .filter((r) => r.unit === "currency" && r.code !== "ILS" && r.buy > 0 && r.sell > 0)
      .map((r) => ({
        code: r.code,
        nameAr: r.nameAr,
        nameEn: r.nameEn,
        buy: r.buy,
        sell: r.sell,
      }));

    if (shop.length) return { rates: [SHEKEL, ...shop], source: "shop" };
  }

  // Market fallback: derive ILS per unit from the USD-based map.
  const ilsPerUsd = fx.ILS;
  const market: ConverterRate[] = [];
  if (Number.isFinite(ilsPerUsd) && ilsPerUsd > 0) {
    for (const code of MARKET_CODES) {
      const perUsd = fx[code];
      if (!Number.isFinite(perUsd) || perUsd <= 0) continue;
      const ilsPerUnit = ilsPerUsd / perUsd;
      market.push({
        code,
        nameAr: MARKET_NAMES[code]?.ar ?? code,
        nameEn: MARKET_NAMES[code]?.en ?? code,
        buy: ilsPerUnit,
        sell: ilsPerUnit,
      });
    }
  }

  return { rates: [SHEKEL, ...market], source: "market" };
}

/** All rates including inactive ones — admin view. */
export async function getAllRates() {
  return safeDb(
    () => prisma.rate.findMany({ orderBy: { sort: "asc" } }),
    [] as Awaited<ReturnType<typeof prisma.rate.findMany>>
  );
}
