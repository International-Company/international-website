import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/** True when a database connection string is configured. */
export const hasDb = Boolean(process.env.DATABASE_URL);

/**
 * Runs a database query, returning `fallback` if the DB is unreachable or
 * unconfigured. The public site must never break because the DB is down.
 */
export async function safeDb<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!hasDb) return fallback;
  try {
    return await fn();
  } catch (err) {
    console.error("[db] query failed:", err);
    return fallback;
  }
}
