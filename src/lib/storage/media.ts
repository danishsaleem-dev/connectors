import "server-only";
import { getStorageAdmin, STORAGE_BUCKET } from "./client";

/** Long enough for one page view or admin review session; short enough that a
 * copied link is dead by the time anyone could reuse it elsewhere. */
const SIGNED_URL_TTL_SECONDS = 60 * 60;

/**
 * Property photos/video and document links can be either an external URL
 * (pasted in manually — the fallback path when upload isn't configured) or a
 * path inside the private Supabase Storage bucket (the real upload path).
 * A value that's already a URL passes through unchanged; a storage path is
 * exchanged for a short-lived signed URL, which is what lets the bucket stay
 * fully private with no public read policy.
 *
 * Failures resolve to null rather than throwing — a dead signed-URL exchange
 * must not take down the whole page render for what's otherwise a working
 * listing.
 */
export async function resolveMediaUrl(
  value: string | null | undefined,
): Promise<string | null> {
  if (!value) return null;
  if (/^https?:\/\//.test(value)) return value;

  try {
    const { data, error } = await getStorageAdmin()
      .storage.from(STORAGE_BUCKET)
      .createSignedUrl(value, SIGNED_URL_TTL_SECONDS);
    if (error || !data) throw error ?? new Error("no signed url returned");
    return data.signedUrl;
  } catch (err) {
    console.error("[media] failed to sign", value, err);
    return null;
  }
}

export async function resolveMediaUrls(
  values: (string | null | undefined)[],
): Promise<string[]> {
  const resolved = await Promise.all(values.map(resolveMediaUrl));
  return resolved.filter((v): v is string => v !== null);
}
