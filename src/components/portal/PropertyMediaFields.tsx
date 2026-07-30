"use client";

import { useState } from "react";
import { Field, FileInput, Input, Textarea } from "@/components/ui";
import { UPLOAD_ENABLED, uploadToStorage } from "@/lib/storage/upload-client";

/**
 * Real drag-and-drop upload, direct from the browser to Supabase Storage —
 * but only once Supabase is configured and NEXT_PUBLIC_ENABLE_FILE_UPLOAD is
 * set to "true". Until then this renders the same paste-in-link fields as
 * before, so the property form works identically with zero setup.
 *
 * Hidden inputs carry a private bucket *path*, not a public URL — the bucket
 * has no public read policy, so viewing later goes through
 * resolveMediaUrl()/<PropertyMedia> rather than the raw value here.
 */
export function PropertyMediaFields({ organizationId }: { organizationId: string }) {
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
        Array.from(files).map((file) => uploadToStorage(file, "property", organizationId)),
      );
      setPhotos((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't upload one or more photos.");
    } finally {
      setUploading(false);
    }
  }

  async function handleVideoFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const path = await uploadToStorage(file, "property", organizationId);
      setVideo(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't upload the video.");
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
