"use client";

import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { Check, ImagePlus, Loader2, Upload, X } from "lucide-react";
import { listMedia, uploadMediaToLibrary, type MediaItem } from "@/lib/portal/media-actions";

export type MediaValue = { path: string; url: string | null };

/**
 * A WordPress-style media picker: a small preview of what's chosen, a
 * "Choose from library" button that opens a modal grid of every image
 * already uploaded (scoped to this org, or to the current admin's own
 * not-yet-attached uploads when organizationId is null — the "Add brand"
 * form, before an org exists to scope to), with uploading a new file done
 * from inside the same modal. Nobody ever sees or types a storage path.
 *
 * Emits its selection as hidden inputs under `name`, so the surrounding
 * <form> reads it exactly like any other field — one input for single mode,
 * one per file for multiple (matching how PropertyMediaFields already does
 * multi-photo hidden inputs).
 */
export function MediaPicker({
  name,
  organizationId,
  multiple = false,
  initial = [],
  label = "Choose from library",
}: {
  name: string;
  organizationId: string | null;
  multiple?: boolean;
  initial?: MediaValue[];
  label?: string;
}) {
  const [selected, setSelected] = useState<MediaValue[]>(initial);
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {selected.map((item) => (
          <div key={item.path} className="group relative h-16 w-16 shrink-0">
            {item.url ? (
              // eslint-disable-next-line @next/next/no-img-element -- a private signed Storage URL.
              <img
                src={item.url}
                alt=""
                className="h-16 w-16 rounded-lg border border-[var(--border)] object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-sunken)] text-[var(--muted)]">
                <ImagePlus size={18} />
              </div>
            )}
            <button
              type="button"
              onClick={() => setSelected((prev) => prev.filter((p) => p.path !== item.path))}
              aria-label="Remove"
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[var(--border)] text-[var(--muted)] transition-colors hover:border-violet-400 hover:text-violet-600"
        >
          <ImagePlus size={18} />
          <span className="text-[10px] leading-none">{selected.length ? "Change" : "Choose"}</span>
        </button>
      </div>

      <p className="mt-1.5 text-xs text-[var(--muted)]">
        {selected.length === 0 && `No image selected — ${label.toLowerCase()}`}
      </p>

      {multiple
        ? selected.map((item) => (
            <input key={item.path} type="hidden" name={name} value={item.path} />
          ))
        : selected[0] && <input type="hidden" name={name} value={selected[0].path} />}

      {open && (
        <PickerModal
          organizationId={organizationId}
          multiple={multiple}
          initiallySelected={selected}
          onCancel={() => setOpen(false)}
          onConfirm={(next) => {
            setSelected(next);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function PickerModal({
  organizationId,
  multiple,
  initiallySelected,
  onCancel,
  onConfirm,
}: {
  organizationId: string | null;
  multiple: boolean;
  initiallySelected: MediaValue[];
  onCancel: () => void;
  onConfirm: (next: MediaValue[]) => void;
}) {
  const [library, setLibrary] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<Map<string, MediaValue>>(
    () => new Map(initiallySelected.map((v) => [v.path, v])),
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    listMedia(organizationId)
      .then((items) => {
        if (!cancelled) setLibrary(items);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load the library.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const filtered = search.trim()
    ? library.filter((item) => item.filename.toLowerCase().includes(search.trim().toLowerCase()))
    : library;

  function toggle(item: MediaItem) {
    setPicked((prev) => {
      const next = new Map(prev);
      if (next.has(item.path)) {
        next.delete(item.path);
      } else {
        if (!multiple) next.clear();
        next.set(item.path, { path: item.path, url: item.url });
      }
      return next;
    });
  }

  async function handleUpload(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("organizationId", organizationId ?? "");
      const result = await uploadMediaToLibrary(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setLibrary((prev) => [result.item, ...prev]);
      setPicked((prev) => {
        const next = multiple ? new Map(prev) : new Map<string, MediaValue>();
        next.set(result.item.path, { path: result.item.path, url: result.item.url });
        return next;
      });
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose an image"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/50 p-4"
      onClick={onCancel}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-[var(--surface)] shadow-[0_32px_64px_-24px_rgba(20,20,26,0.4)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h2 className="font-display text-lg">Choose an image</h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="rounded-full p-1.5 text-[var(--muted)] transition-colors hover:bg-violet-600/[0.06] hover:text-violet-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by file name…"
            className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm outline-none transition-colors placeholder:text-[var(--muted)]/60 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
          />
          <label
            className={clsx(
              "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700",
              uploading && "pointer-events-none opacity-60",
            )}
          >
            {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            {uploading ? "Uploading…" : "Upload new"}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploading}
              onChange={(e) => handleUpload(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        {error && <p className="px-5 pt-3 text-sm text-red-600">{error}</p>}

        <div className="no-scrollbar flex-1 overflow-y-auto p-5" data-lenis-prevent>
          {loading ? (
            <div className="flex items-center justify-center py-16 text-[var(--muted)]">
              <Loader2 size={20} className="animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-[var(--muted)]">
              {library.length === 0
                ? "Nothing uploaded yet — upload your first image above."
                : "No files match that search."}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {filtered.map((item) => {
                const isPicked = picked.has(item.path);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggle(item)}
                    className={clsx(
                      "group relative aspect-square overflow-hidden rounded-xl border-2 transition-colors",
                      isPicked ? "border-violet-600" : "border-transparent hover:border-violet-400/50",
                    )}
                  >
                    {item.url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- a private signed Storage URL.
                      <img src={item.url} alt={item.filename} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[var(--surface-sunken)] text-[var(--muted)]">
                        <ImagePlus size={20} />
                      </div>
                    )}
                    {isPicked && (
                      <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-white">
                        <Check size={13} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-4">
          <p className="text-xs text-[var(--muted)]">
            {picked.size === 0
              ? "Nothing selected"
              : `${picked.size} image${picked.size === 1 ? "" : "s"} selected`}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full px-4 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-violet-600/[0.06] hover:text-violet-600"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={picked.size === 0}
              onClick={() => onConfirm([...picked.values()])}
              className="rounded-full bg-violet-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:pointer-events-none disabled:opacity-40"
            >
              Use selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
