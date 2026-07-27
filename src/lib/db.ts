import { PrismaClient } from "@/generated/prisma";

/** True when a database connection string is configured. */
export const hasDb = Boolean(process.env.DATABASE_URL);

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Lazily created Prisma client. Constructing it without DATABASE_URL would
 * throw at import time and take the whole site down, so we only build it on
 * first use and only when a database is actually configured.
 */
function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return Reflect.get(getClient(), prop);
  },
});

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
