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
    // prepare: false is required against Supabase's transaction-mode pooler
    // (port 6543) — pgbouncer in that mode can't hold a prepared statement
    // across pooled connections. Harmless against a direct connection too, so
    // it's left on unconditionally rather than branching on the URL.
    cached = drizzle(postgres(url, { max: 1, prepare: false }), { schema });
  }
  return cached;
}
