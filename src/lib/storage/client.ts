import "server-only";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

/**
 * The bucket is private with no public read policy at all — everything goes
 * through this service-role client, which bypasses Storage policies entirely.
 * That's a deliberate simplification: no RLS policies to author or get wrong,
 * because our own auth check (getCurrentUser + the ownership rule) is the only
 * gate, same as every other data-access path in the portal.
 */
export const STORAGE_BUCKET = "portal-files";

/** Shared by every upload path (web media-actions, mobile's own upload
 * route) — one place to change the limits rather than two copies that can
 * drift. Not exported from media-actions.ts itself: a "use server" file may
 * only export async functions, so a plain constant has to live here. */
export const UPLOAD_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
export const UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

/** Same two purposes /api/upload has always issued signed-upload tokens
 * for — moved here so the mobile upload route (which uploads server-side,
 * skipping that signed-URL dance entirely) validates against the exact
 * same rules instead of a second, driftable copy. */
export const UPLOAD_PURPOSES = {
  property: {
    // HEIC/HEIF is the default iPhone camera format — photos are only ever
    // stored and linked, never decoded or rendered inline, so there's no
    // browser-compatibility reason to reject a format we don't display anyway.
    allowed: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
      "video/mp4",
      "video/quicktime",
    ],
    maxBytes: 50 * 1024 * 1024,
  },
  document: {
    allowed: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    maxBytes: 20 * 1024 * 1024,
  },
} as const;

export type UploadPurpose = keyof typeof UPLOAD_PURPOSES;

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

/**
 * Uploads a small file (a media-library image, not a large property photo/
 * video) straight from inside a Server Action, using the service-role client
 * directly rather than the signed-upload-URL dance the client-side property
 * uploads use. That dance exists to authorize a specific path *before* the
 * file leaves the browser; here the action is already server code with full
 * Storage access, so it's simpler to just upload.
 *
 * `pathPrefix` is caller-built (e.g. `media/<organizationId>` or
 * `media/holding/<userId>` for a file picked before an org exists) — this
 * function only owns the random, collision-proof filename under it.
 *
 * Returns null (never throws) if Storage isn't configured or the upload
 * fails — the caller decides how to react rather than this taking down
 * whatever form submission it rode in on.
 */
export async function uploadServerFile(
  file: File,
  pathPrefix: string,
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-100);
    const path = `${pathPrefix}/${randomUUID()}-${safeName}`;
    const { error } = await getStorageAdmin()
      .storage.from(STORAGE_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw error;
    return path;
  } catch (err) {
    console.error("[storage] server-side upload failed", err);
    return null;
  }
}
