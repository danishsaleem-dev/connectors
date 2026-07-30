"use client";

import { useState } from "react";
import { Field, FileInput, Input } from "@/components/ui";
import { UPLOAD_ENABLED, uploadToStorage } from "@/lib/storage/upload-client";

/**
 * The admin "add document" field — a real file upload once Supabase Storage
 * is configured, falling back to the original paste-a-link input otherwise
 * (e.g. a Google Drive share link). createDocument() doesn't care which it
 * gets: both are just a string in the same `url` column, told apart at
 * display time by resolveMediaUrl().
 */
export function DocumentUpload({ organizationId }: { organizationId: string }) {
  const [path, setPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!UPLOAD_ENABLED) {
    return (
      <Field label="Link" className="sm:col-span-2">
        <Input name="url" type="url" required placeholder="https://…" />
      </Field>
    );
  }

  async function handleFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      setPath(await uploadToStorage(file, "document", organizationId));
    } catch {
      setError("Couldn't upload that file.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Field label="File" hint="PDF, Word doc, or image" className="sm:col-span-2">
      <FileInput
        accept=".pdf,.doc,.docx,image/*"
        disabled={uploading}
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
      {path && <input type="hidden" name="url" value={path} />}
      {path && <p className="mt-1.5 text-xs text-[var(--muted)]">Uploaded.</p>}
      {uploading && <p className="mt-1.5 text-xs text-violet-600">Uploading…</p>}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </Field>
  );
}
