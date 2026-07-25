/**
 * Live market data — free, keyless sources with graceful fallbacks.
 * FX:    https://open.er-api.com  (updated daily, cached 30 min)
 * Metals: https://api.gold-api.com (live spot, cached 10 min)
 */

export type FxRates = Record<string, number>;

/** Fallback snapshot used if the live source is unreachable. */
export const FX_FALLBACK: FxRates = {
  USD: 1,
  ILS: 3.05,
  EUR: 0.879,
  GBP: 0.746,
  SAR: 3.75,
  AED: 3.6725,
  TRY: 47.33,
  EGP: 51.33,
};

const METAL_FALLBACK: Record<string, number> = { XAU: 4050, XAG: 58 };

export async function getFxRates(): Promise<{
  rates: FxRates;
  updated: string;
  live: boolean;
}> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 1800 },
    });
    if (!res.ok) throw new Error(`fx ${res.status}`);
    const data = await res.json();
    if (data?.result !== "success" || !data?.rates) throw new Error("fx payload");
    return {
      rates: data.rates as FxRates,
      updated: data.time_last_update_utc ?? "",
      live: true,
    };
  } catch {
    return { rates: FX_FALLBACK, updated: "", live: false };
  }
}

export async function getMetalPrice(symbol: "XAU" | "XAG"): Promise<{
  price: number;
  live: boolean;
}> {
  try {
    const res = await fetch(`https://api.gold-api.com/price/${symbol}`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) throw new Error(`metal ${res.status}`);
    const data = await res.json();
    if (typeof data?.price !== "number") throw new Error("metal payload");
    return { price: data.price, live: true };
  } catch {
    return { price: METAL_FALLBACK[symbol], live: false };
  }
}
