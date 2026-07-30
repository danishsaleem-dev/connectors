import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * The bucket is private with no public read policy at all — everything goes
 * through this service-role client, which bypasses Storage policies entirely.
 * That's a deliberate simplification: no RLS policies to author or get wrong,
 * because our own auth check (getCurrentUser + the ownership rule) is the only
 * gate, same as every other data-access path in the portal.
 */
export const STORAGE_BUCKET = "portal-files";

/**
 * Lazy for the same reason getDb() is: importing this file must not throw
 * when Supabase isn't configured (local dev without upload enabled).
 * Service-role key only — never import this from a "use client" module.
 */
let cached: ReturnType<typeof createClient> | undefined;

export function getStorageAdmin() {
  if (!cached) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "Supabase Storage isn't configured — set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      );
    }
    cached = createClient(url, key, { auth: { persistSession: false } });
  }
  return cached;
}
