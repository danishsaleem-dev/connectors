"use server";

import { and, desc, eq, ilike, isNull, or } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db/client";
import { media } from "@/lib/db/schema";
import { uploadServerFile } from "@/lib/storage/client";
import { resolveMediaUrl } from "@/lib/storage/media";

/**
 * Backs the media-library picker modal — called directly from client code
 * (not through a <form>), which Server Actions support as a plain async call.
 */

export type MediaItem = {
  id: string;
  path: string;
  filename: string;
  /** Resolved signed URL, ready to render — null if signing failed. */
  url: string | null;
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/**
 * An admin browsing a specific org's page sees that org's images; a
 * participant (always scoped to their own org, the form-supplied id is
 * ignored) sees the same for theirs. Either also sees their own
 * not-yet-attached holding uploads — the ones picked/uploaded on the
 * "Add brand" form before an org existed to claim them. Images only: the two
 * places this feeds (brand logo, property photos) never need documents.
 */
export async function listMedia(requestedOrgId: string | null): Promise<MediaItem[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated.");

  const orgId = user.isAdmin ? requestedOrgId : user.organizationId;
  if (!user.isAdmin && !orgId) throw new Error("No organization on this account.");

  const scope = orgId
    ? or(
        eq(media.organizationId, orgId),
        and(isNull(media.organizationId), eq(media.uploadedByUserId, user.id)),
      )
    : and(isNull(media.organizationId), eq(media.uploadedByUserId, user.id));

  const rows = await getDb()
    .select()
    .from(media)
    .where(and(ilike(media.contentType, "image/%"), scope))
    .orderBy(desc(media.createdAt))
    .limit(100);

  const urls = await Promise.all(rows.map((row) => resolveMediaUrl(row.path)));
  return rows.map((row, i) => ({
    id: row.id,
    path: row.path,
    filename: row.filename,
    url: urls[i],
  }));
}

export async function uploadMediaToLibrary(
  formData: FormData,
): Promise<{ ok: true; item: MediaItem } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Your session has expired — sign in again." };

  const requestedOrgId = (formData.get("organizationId") as string | null) || null;
  const orgId = user.isAdmin ? requestedOrgId : user.organizationId;
  if (!user.isAdmin && !orgId) return { ok: false, error: "No organization on this account." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose a file." };
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, error: "That file type isn't supported." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "File is too large — 10MB max." };
  }

  // No org yet (the create-brand form) uploads to the user's own holding
  // area instead of a path that doesn't have anywhere to live yet.
  const pathPrefix = orgId ? `media/${orgId}` : `media/holding/${user.id}`;
  const path = await uploadServerFile(file, pathPrefix);
  if (!path) return { ok: false, error: "Upload failed." };

  const [row] = await getDb()
    .insert(media)
    .values({
      organizationId: orgId,
      uploadedByUserId: user.id,
      path,
      filename: file.name,
      contentType: file.type,
      size: file.size,
    })
    .returning();

  const url = await resolveMediaUrl(row.path);
  return { ok: true, item: { id: row.id, path: row.path, filename: row.filename, url } };
}
