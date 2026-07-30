"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { Field, FileInput, Input, Textarea } from "@/components/ui";

const UPLOAD_ENABLED = process.env.NEXT_PUBLIC_ENABLE_FILE_UPLOAD === "true";

/**
 * Real drag-and-drop upload, direct from the browser to Vercel Blob — but
 * only once BLOB_READ_WRITE_TOKEN is configured and
 * NEXT_PUBLIC_ENABLE_FILE_UPLOAD is set to "true". Until then this renders
 * the same paste-in-link fields as before, so the property form works
 * identically with zero setup.
 */
export function PropertyMediaFields() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!UPLOAD_ENABLED) {
    return (
      <>
        <Field
          label="Photo links"
          hint="One per line — paste a link to each photo"
          className="sm:col-span-2"
        >
          <Textarea name="photos" rows={3} placeholder="https://…" />
        </Field>
        <Field label="Video link" hint="Optional" className="sm:col-span-2">
          <Input name="video" type="url" placeholder="https://…" />
        </Field>
      </>
    );
  }

  async function handlePhotoFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded = await Promise.all(
        Array.from(files).map((file) =>
          upload(file.name, file, {
            access: "public",
            handleUploadUrl: "/api/property-upload",
          }),
        ),
      );
      setPhotos((prev) => [...prev, ...uploaded.map((u) => u.url)]);
    } catch {
      setError("Couldn't upload one or more photos.");
    } finally {
      setUploading(false);
    }
  }

  async function handleVideoFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/property-upload",
      });
      setVideo(uploaded.url);
    } catch {
      setError("Couldn't upload the video.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <Field label="Photos" hint="Multiple allowed" className="sm:col-span-2">
        <FileInput
          accept="image/*"
          multiple
          disabled={uploading}
          onChange={(e) => handlePhotoFiles(e.target.files)}
        />
        {photos.length > 0 && (
          <p className="mt-1.5 text-xs text-[var(--muted)]">
            {photos.length} photo{photos.length === 1 ? "" : "s"} uploaded.
          </p>
        )}
        {photos.map((url) => (
          <input key={url} type="hidden" name="photos" value={url} />
        ))}
      </Field>
      <Field label="Video" hint="Optional" className="sm:col-span-2">
        <FileInput
          accept="video/*"
          disabled={uploading}
          onChange={(e) => handleVideoFile(e.target.files?.[0] ?? null)}
        />
        {video && <p className="mt-1.5 text-xs text-[var(--muted)]">Video uploaded.</p>}
        {video && <input type="hidden" name="video" value={video} />}
      </Field>
      {uploading && (
        <p className="text-xs text-violet-600 sm:col-span-2">Uploading…</p>
      )}
      {error && <p className="text-xs text-red-600 sm:col-span-2">{error}</p>}
    </>
  );
}
