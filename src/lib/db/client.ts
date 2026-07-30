import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

/**
 * Lazy on purpose: a plain module-level `postgres(url)` call would throw at
 * import time whenever DATABASE_URL is unset, which would break every page
 * that transitively imports this file even if it never queries the db. This
 * only connects the first time something actually calls getDb().
 */
let cached: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDb() {
  if (!cached) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set — add it to .env.local (any standard Postgres connection string works: Neon, Supabase, Railway, or a local instance).",
      );
    }
    cached = drizzle(
      postgres(url, {
        max: 1,
        // prepare: false is required against Supabase's transaction-mode
        // pooler (port 6543) — pgbouncer in that mode can't hold a prepared
        // statement across pooled connections. Harmless against a direct
        // connection too, so it's left on unconditionally rather than
        // branching on the URL.
        prepare: false,
        // Without an idle_timeout, this connection stays open indefinitely —
        // fine for a long-lived server, but in a serverless function nothing
        // ever tells it to let go. Supabase's pooler only has a limited
        // number of backend connections; enough invocations holding one open
        // exhausts the pool and every new connection (including unrelated
        // ones) queues behind it, which is what "canceling statement due to
        // statement timeout" and requests hanging until Vercel's own function
        // timeout were actually caused by — not a bad connection string.
        idle_timeout: 20,
        // Recycle the connection periodically rather than trusting a single
        // long-lived socket in a network path (serverless host → pooler)
        // that has no persistent process to notice and recover from a
        // half-dead connection.
        max_lifetime: 60 * 30,
        // Fail fast on a genuinely broken connection instead of hanging for
        // the driver's much longer default.
        connect_timeout: 10,
      }),
      { schema },
    );
  }
  return cached;
}
