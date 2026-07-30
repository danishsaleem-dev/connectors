import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getStorageAdmin, STORAGE_BUCKET } from "@/lib/storage/client";

const PURPOSES = {
  property: {
    // HEIC/HEIF is the default iPhone camera format — photos are only ever
    // stored and linked here, never decoded or rendered inline, so there's no
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

type Purpose = keyof typeof PURPOSES;

/**
 * Issues a short-lived signed upload URL for a direct browser-to-Supabase
 * upload — the file itself never passes through this server, only this small
 * token exchange does. The bucket is fully private with no public read
 * policy, so viewing later goes through resolveMediaUrl() instead.
 *
 * organizationId is which org the file belongs to, not necessarily the
 * uploader's own — an admin uploads on behalf of any org. Same ownership rule
 * as every other data-access path: admins may act on any org, a participant
 * only their own.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = (await request.json()) as {
    filename?: string;
    contentType?: string;
    size?: number;
    purpose?: Purpose;
    organizationId?: string;
  };

  const organizationId = body.organizationId;
  if (!organizationId) {
    return NextResponse.json({ error: "Missing organization." }, { status: 400 });
  }
  if (!user.isAdmin && user.organizationId !== organizationId) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

  const purpose = body.purpose && PURPOSES[body.purpose] ? body.purpose : null;
  if (!purpose || !body.filename || !body.contentType) {
    return NextResponse.json({ error: "Missing upload details." }, { status: 400 });
  }

  const rules = PURPOSES[purpose];
  // `allowed` is a union of two differently-typed readonly tuples once indexed
  // by a union key, so .includes() would otherwise only accept one branch's
  // literal type — widen to plain strings for the actual runtime check.
  if (!(rules.allowed as readonly string[]).includes(body.contentType)) {
    return NextResponse.json({ error: "That file type isn't supported." }, { status: 400 });
  }
  if (typeof body.size === "number" && body.size > rules.maxBytes) {
    return NextResponse.json({ error: "File is too large." }, { status: 400 });
  }

  const safeName = body.filename.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-100);
  const path = `${purpose}s/${organizationId}/${randomUUID()}-${safeName}`;

  try {
    const { data, error } = await getStorageAdmin()
      .storage.from(STORAGE_BUCKET)
      .createSignedUploadUrl(path);
    if (error || !data) throw error ?? new Error("no signed upload url returned");

    return NextResponse.json({ path: data.path, token: data.token });
  } catch (err) {
    console.error("[upload] failed to create signed upload url", err);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
