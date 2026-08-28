"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Field, FileInput, Input, Textarea } from "@/components/ui";
import { UPLOAD_ENABLED, uploadToStorage } from "@/lib/storage/upload-client";

type MediaItem = {
  /** The private Storage path — what actually gets submitted and saved.
   * Never a URL: the bucket has no public read policy, so a signed URL is
   * only ever good for the ~1 hour it was minted for, and must never be
   * written back into the database in place of the path. */
  path: string;
  /** What renders as the thumbnail — a signed URL for something already
   * saved (resolved server-side by the caller), or a local blob: URL for
   * something picked in this session that hasn't round-tripped yet. Null
   * only if a signed URL failed to resolve. */
  previewUrl: string | null;
};

/**
 * Real drag-and-drop upload, direct from the browser to Supabase Storage —
 * but only once Supabase is configured and NEXT_PUBLIC_ENABLE_FILE_UPLOAD is
 * set to "true". Until then this renders the same paste-in-link fields as
 * before, so the property form works identically with zero setup.
 *
 * Shows every photo as an actual thumbnail — already-saved ones (passed in
 * via [initialPhotos], resolved to signed URLs by the caller, a Server
 * Component) alongside anything picked in this session — rather than a
 * blind "Choose Files" with no way to see what's already there. This is
 * also what fixes a real data-loss bug: previously, an edit form with no
 * `initial` prop only ever knew about *newly* uploaded photos, so saving an
 * edit without touching photos submitted an empty photos list and silently
 * wiped every photo the property already had. Preserving [initialPhotos] as
 * hidden inputs (unless explicitly removed) is what stops that.
 */
export function PropertyMediaFields({
  organizationId,
  initialPhotos = [],
  initialVideo = null,
}: {
  organizationId: string;
  initialPhotos?: MediaItem[];
  initialVideo?: MediaItem | null;
}) {
  const [photos, setPhotos] = useState<MediaItem[]>(initialPhotos);
  const [video, setVideo] = useState<MediaItem | null>(initialVideo);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local blob: previews are only good for this tab's lifetime — release
  // them on unmount so a long admin session doesn't leak memory.
  useEffect(() => {
    return () => {
      for (const p of photos) if (p.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(p.previewUrl);
      if (video?.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(video.previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cleanup reads latest state via closure over refs would be overkill here; this only ever runs once, on unmount
  }, []);

  if (!UPLOAD_ENABLED) {
    return (
      <>
        <Field
          label="Photo links"
          hint="One per line — paste a link to each photo"
          className="sm:col-span-2"
        >
          <Textarea
            name="photos"
            rows={3}
            placeholder="https://…"
            defaultValue={initialPhotos.map((p) => p.path).join("\n")}
          />
        </Field>
        <Field label="Video link" hint="Optional" className="sm:col-span-2">
          <Input name="video" type="url" defaultValue={initialVideo?.path ?? ""} placeholder="https://…" />
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
        Array.from(files).map(async (file) => ({
          path: await uploadToStorage(file, "property", organizationId),
          previewUrl: URL.createObjectURL(file),
        })),
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
      setVideo({ path, previewUrl: URL.createObjectURL(file) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't upload the video.");
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(path: string) {
    setPhotos((prev) => {
      const removed = prev.find((p) => p.path === path);
      if (removed?.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((p) => p.path !== path);
    });
  }

  return (
    <>
      <Field label="Photos" hint="Multiple allowed" className="sm:col-span-2">
        <div className="flex flex-wrap gap-3">
          {photos.map((photo) => (
            <div key={photo.path} className="group relative h-20 w-20 shrink-0">
              <div className="h-full w-full overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-sunken)]">
                {photo.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- signed/blob URL, not an optimizable remote asset
                  <img src={photo.previewUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-[var(--muted)]">
                    Unavailable
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removePhoto(photo.path)}
                aria-label="Remove this photo"
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <X size={12} />
              </button>
              <input type="hidden" name="photos" value={photo.path} />
            </div>
          ))}
          <label className="flex h-20 w-20 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[var(--border)] text-center text-[11px] text-[var(--muted)] transition-colors hover:border-violet-400 hover:text-violet-600">
            <span className="text-lg leading-none">+</span>
            <span>Add</span>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              onChange={(e) => handlePhotoFiles(e.target.files)}
              className="hidden"
            />
          </label>
        </div>
        {uploading && <p className="mt-2 text-xs text-violet-600">Uploading…</p>}
      </Field>
      <Field label="Video" hint="Optional" className="sm:col-span-2">
        {video ? (
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--muted)]">Video attached.</span>
            <button
              type="button"
              onClick={() => {
                if (video.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(video.previewUrl);
                setVideo(null);
              }}
              className="text-xs text-red-600 underline underline-offset-4"
            >
              Remove
            </button>
            <input type="hidden" name="video" value={video.path} />
          </div>
        ) : (
          <FileInput
            accept="video/*"
            disabled={uploading}
            onChange={(e) => handleVideoFile(e.target.files?.[0] ?? null)}
          />
        )}
      </Field>
      {error && <p className="text-xs text-red-600 sm:col-span-2">{error}</p>}
    </>
  );
}
