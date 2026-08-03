"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { Plus, X } from "lucide-react";
import { Field, FileInput, Input, Textarea } from "@/components/ui";
import { UPLOAD_ENABLED, uploadToStorage } from "@/lib/storage/upload-client";

type EntryField = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "file";
  placeholder?: string;
  span?: 1 | 2;
};

/**
 * Backs both "Experience" and "Education" on the consultant form — same
 * add/remove/serialize behaviour, just a different field set. Serializes to
 * one hidden JSON input rather than bracket-notation field names, so the
 * server action just does JSON.parse(str(formData, name)) instead of
 * reconstructing an array from scattered FormData keys.
 *
 * A "file" field stores a Storage *path* in that same JSON, exactly like the
 * other fields — the upload happens immediately on choose (same pattern as
 * DocumentUpload/PropertyMediaFields), and the returned path just becomes
 * this entry's value for that key.
 */
export function RepeatableEntries({
  name,
  addLabel,
  fields,
  initial = [],
  existingFileUrls = [],
}: {
  name: string;
  addLabel: string;
  fields: EntryField[];
  initial?: Record<string, string>[];
  /** Signed URLs for each entry's current file, index-aligned with
   * `initial` — resolved server-side since signing requires the
   * service-role client. Only meaningful for entries present at mount. */
  existingFileUrls?: (string | null)[];
}) {
  const [entries, setEntries] = useState<Record<string, string>[]>(initial);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update(i: number, key: string, value: string) {
    setEntries((prev) => prev.map((e, idx) => (idx === i ? { ...e, [key]: value } : e)));
  }
  function add() {
    setEntries((prev) => [...prev, Object.fromEntries(fields.map((f) => [f.key, ""]))]);
  }
  function remove(i: number) {
    setEntries((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleFile(i: number, key: string, file: File | null) {
    if (!file) return;
    const slot = `${i}-${key}`;
    setUploading((prev) => ({ ...prev, [slot]: true }));
    setErrors((prev) => ({ ...prev, [slot]: "" }));
    try {
      const path = await uploadToStorage(file, "document", "consultants");
      update(i, key, path);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [slot]: err instanceof Error ? err.message : "Couldn't upload that file.",
      }));
    } finally {
      setUploading((prev) => ({ ...prev, [slot]: false }));
    }
  }

  return (
    <div className="sm:col-span-2">
      <input type="hidden" name={name} value={JSON.stringify(entries)} />

      {entries.length > 0 && (
        <div className="space-y-4">
          {entries.map((entry, i) => (
            <div key={i} className="rounded-xl border border-[var(--border)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                  {fields.map((f) => {
                    if (f.type === "file") {
                      const slot = `${i}-${f.key}`;
                      const existingUrl = i < existingFileUrls.length ? existingFileUrls[i] : null;
                      return (
                        <Field
                          key={f.key}
                          label={f.label}
                          hint="Optional — PDF, Word doc, or image"
                          className={clsx(f.span === 2 && "sm:col-span-2")}
                        >
                          {UPLOAD_ENABLED ? (
                            <>
                              <FileInput
                                accept=".pdf,.doc,.docx,image/*"
                                disabled={uploading[slot]}
                                onChange={(e) => handleFile(i, f.key, e.target.files?.[0] ?? null)}
                              />
                              {uploading[slot] && (
                                <p className="mt-1.5 text-xs text-violet-600">Uploading…</p>
                              )}
                              {errors[slot] && (
                                <p className="mt-1.5 text-xs text-red-600">{errors[slot]}</p>
                              )}
                              {!uploading[slot] && !errors[slot] && entry[f.key] && (
                                <p className="mt-1.5 text-xs text-[var(--muted)]">
                                  {existingUrl ? (
                                    <a
                                      href={existingUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-violet-600 underline underline-offset-4"
                                    >
                                      View current file
                                    </a>
                                  ) : (
                                    "Uploaded."
                                  )}
                                </p>
                              )}
                            </>
                          ) : (
                            <Input
                              value={entry[f.key] ?? ""}
                              placeholder="https://…"
                              onChange={(e) => update(i, f.key, e.target.value)}
                            />
                          )}
                        </Field>
                      );
                    }
                    return (
                      <Field
                        key={f.key}
                        label={f.label}
                        className={clsx(f.span === 2 && "sm:col-span-2")}
                      >
                        {f.type === "textarea" ? (
                          <Textarea
                            rows={2}
                            value={entry[f.key] ?? ""}
                            placeholder={f.placeholder}
                            onChange={(e) => update(i, f.key, e.target.value)}
                          />
                        ) : (
                          <Input
                            value={entry[f.key] ?? ""}
                            placeholder={f.placeholder}
                            onChange={(e) => update(i, f.key, e.target.value)}
                          />
                        )}
                      </Field>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label="Remove entry"
                  className="shrink-0 rounded-full p-1.5 text-[var(--muted)] transition-colors hover:text-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={add}
        className={clsx(
          "inline-flex items-center gap-1.5 text-sm font-medium text-violet-600",
          entries.length > 0 && "mt-3",
        )}
      >
        <Plus size={14} /> {addLabel}
      </button>
    </div>
  );
}
