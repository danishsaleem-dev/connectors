import { NextResponse } from "next/server";
import { verifyMobileSession } from "@/lib/auth/mobile-session";
import {
  UPLOAD_ALLOWED_TYPES,
  UPLOAD_MAX_BYTES,
  UPLOAD_PURPOSES,
  uploadServerFile,
} from "@/lib/storage/client";
import { resolveMediaUrl } from "@/lib/storage/media";

export const runtime = "nodejs";

/**
 * The mobile equivalent of two different web upload paths, unified into one
 * route: MediaPicker's "media library" upload (photo — profile/consultant
 * photo) and /api/upload's "document" purpose (consultant experience/
 * education attachments, enquiry form attachments).
 *
 * Deliberately server-side (uploadServerFile), not the signed-upload-URL
 * dance /api/upload issues for the web — that exists so a large file never
 * passes through a Next.js Server Action's body-size limits from a
 * *browser*; a mobile client posting multipart/form-data to a route handler
 * has no such constraint, so there's nothing to route around here.
 *
 * "photo" isn't tracked in the `media` table the way the web's library
 * upload is — that table only backs the "choose from an existing upload"
 * picker UI, which the app doesn't have (a profile photo is always a fresh
 * pick, never chosen from history), so there's nothing for a row to serve.
 */
export async function POST(request: Request) {
  const session = await verifyMobileSession(request);
  if (!session || !session.organizationId) {
    return NextResponse.json({ ok: false, error: "Session expired." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid upload." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ ok: false, error: "Choose a file." }, { status: 400 });
  }

  const purpose = formData.get("purpose");
  const isDocument = purpose === "document";

  const allowed = isDocument ? UPLOAD_PURPOSES.document.allowed : UPLOAD_ALLOWED_TYPES;
  const maxBytes = isDocument ? UPLOAD_PURPOSES.document.maxBytes : UPLOAD_MAX_BYTES;
  if (!(allowed as readonly string[]).includes(file.type)) {
    return NextResponse.json({ ok: false, error: "That file type isn't supported." }, { status: 400 });
  }
  if (file.size > maxBytes) {
    const limitMb = Math.round(maxBytes / (1024 * 1024));
    return NextResponse.json(
      { ok: false, error: `File is too large — ${limitMb}MB max.` },
      { status: 400 },
    );
  }

  const pathPrefix = isDocument
    ? `documents/${session.organizationId}`
    : `media/${session.organizationId}`;
  const path = await uploadServerFile(file, pathPrefix);
  if (!path) {
    return NextResponse.json({ ok: false, error: "Upload failed." }, { status: 500 });
  }

  const url = await resolveMediaUrl(path);
  return NextResponse.json({ ok: true, path, url });
}
