/**
 * Production entrypoint.
 *
 * Applies database migrations when a DATABASE_URL is configured, but never
 * blocks the site from booting: if the database is missing or unreachable the
 * public site still starts and serves fallback rates.
 */
import { spawn, spawnSync } from "node:child_process";

const hasDb = Boolean(process.env.DATABASE_URL);

if (hasDb) {
  console.log("[start] DATABASE_URL found — applying migrations...");
  const res = spawnSync("npx", ["prisma", "migrate", "deploy"], {
    stdio: "inherit",
    shell: true,
  });
  if (res.status === 0) {
    console.log("[start] migrations applied.");
  } else {
    console.error(
      "[start] migrations failed (exit " + res.status + "). Continuing — the site will run with fallback data."
    );
  }
} else {
  console.warn(
    "[start] No DATABASE_URL set. Admin panel and requests are disabled; the public site runs with fallback rates."
  );
}

const next = spawn("npx", ["next", "start"], { stdio: "inherit", shell: true });
next.on("exit", (code) => process.exit(code ?? 0));
