"use client";

import { createClient } from "@supabase/supabase-js";

export const UPLOAD_ENABLED = process.env.NEXT_PUBLIC_ENABLE_FILE_UPLOAD === "true";

// The anon key is safe to expose — it grants nothing on its own against a
// bucket with no public policies. The one-time upload token from /api/upload
// is what actually authorizes writing to a specific path.
const supabasePublic =
  UPLOAD_ENABLED && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      )
    : null;

const STORAGE_BUCKET = "portal-files";

/** Requests a signed upload slot for this org, then uploads the file straight
 * to Supabase Storage from the browser. Returns the storage path to save. */
export async function uploadToStorage(
  file: File,
  purpose: "property" | "document",
  organizationId: string,
): Promise<string> {
  if (!supabasePublic) {
    throw new Error("File upload isn't configured.");
  }

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      size: file.size,
      purpose,
      organizationId,
    }),
  });
  const json = (await res.json()) as { path?: string; token?: string; error?: string };
  if (!res.ok || !json.path || !json.token) {
    throw new Error(json.error ?? "Upload failed.");
  }

  const { error } = await supabasePublic.storage
    .from(STORAGE_BUCKET)
    .uploadToSignedUrl(json.path, json.token, file);
  if (error) throw error;

  return json.path;
}
