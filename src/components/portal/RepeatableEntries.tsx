"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { Plus, X } from "lucide-react";
import { Field, Input, Textarea } from "@/components/ui";

type EntryField = {
  key: string;
  label: string;
  type?: "text" | "textarea";
  placeholder?: string;
  span?: 1 | 2;
};

/**
 * Backs both "Experience" and "Education" on the consultant form — same
 * add/remove/serialize behaviour, just a different field set. Serializes to
 * one hidden JSON input rather than bracket-notation field names, so the
 * server action just does JSON.parse(str(formData, name)) instead of
 * reconstructing an array from scattered FormData keys.
 */
export function RepeatableEntries({
  name,
  addLabel,
  fields,
  initial = [],
}: {
  name: string;
  addLabel: string;
  fields: EntryField[];
  initial?: Record<string, string>[];
}) {
  const [entries, setEntries] = useState<Record<string, string>[]>(initial);

  function update(i: number, key: string, value: string) {
    setEntries((prev) => prev.map((e, idx) => (idx === i ? { ...e, [key]: value } : e)));
  }
  function add() {
    setEntries((prev) => [...prev, Object.fromEntries(fields.map((f) => [f.key, ""]))]);
  }
  function remove(i: number) {
    setEntries((prev) => prev.filter((_, idx) => idx !== i));
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
                  {fields.map((f) => (
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
                  ))}
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
