/** Seed / fallback company rates shown before the admin sets real ones. */
export type CompanyRate = {
  code: string;
  nameAr: string;
  nameEn: string;
  buy: number;
  sell: number;
  unit: "currency" | "gold";
  sort: number;
  active: boolean;
};

export const DEFAULT_RATES: CompanyRate[] = [
  { code: "USD", nameAr: "دولار أمريكي", nameEn: "US Dollar", buy: 3.03, sell: 3.08, unit: "currency", sort: 1, active: true },
  { code: "JOD", nameAr: "دينار أردني", nameEn: "Jordanian Dinar", buy: 4.28, sell: 4.36, unit: "currency", sort: 2, active: true },
  { code: "EUR", nameAr: "يورو", nameEn: "Euro", buy: 3.32, sell: 3.42, unit: "currency", sort: 3, active: true },
  { code: "EGP", nameAr: "جنيه مصري", nameEn: "Egyptian Pound", buy: 0.058, sell: 0.063, unit: "currency", sort: 4, active: true },
  { code: "SAR", nameAr: "ريال سعودي", nameEn: "Saudi Riyal", buy: 0.8, sell: 0.83, unit: "currency", sort: 5, active: true },
  { code: "AED", nameAr: "درهم إماراتي", nameEn: "UAE Dirham", buy: 0.82, sell: 0.85, unit: "currency", sort: 6, active: true },
  // Gold is quoted per gram in Jordanian Dinar (JOD).
  { code: "GOLD24", nameAr: "ذهب عيار 24", nameEn: "Gold 24K", buy: 92, sell: 96, unit: "gold", sort: 7, active: true },
  { code: "GOLD21", nameAr: "ذهب عيار 21", nameEn: "Gold 21K", buy: 80, sell: 84, unit: "gold", sort: 8, active: true },
  { code: "GOLD18", nameAr: "ذهب عيار 18", nameEn: "Gold 18K", buy: 69, sell: 72, unit: "gold", sort: 9, active: true },
];
