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
    cached = drizzle(postgres(url, { max: 1 }), { schema });
  }
  return cached;
}
