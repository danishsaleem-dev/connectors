"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { Plus, X } from "lucide-react";
import { Input, Textarea } from "@/components/ui";

type Entry = { name: string; description?: string };

/**
 * Areas of expertise, as chips rather than stacked blocks.
 *
 * This replaces a generic RepeatableEntries list where every area rendered
 * as a bordered card with its own name input *and* a full description
 * textarea. Six areas meant roughly six screens of scrolling to review a
 * profile — and the description is optional and usually empty, so most of
 * that height was blank textareas.
 *
 * Here the areas live on one wrapping row. Descriptions still exist, but
 * only one is open at a time: click a chip to edit its description
 * underneath. The serialized shape is unchanged — one hidden JSON input,
 * `{name, description}[]` — so the server action is untouched.
 */
export function ExpertiseEditor({
  name,
  initial = [],
  suggestions = [],
}: {
  name: string;
  initial?: Entry[];
  suggestions?: string[];
}) {
  const [entries, setEntries] = useState<Entry[]>(initial);
  const [draft, setDraft] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const listId = `${name}-suggestions`;
  const taken = new Set(entries.map((e) => e.name.trim().toLowerCase()));

  function add() {
    const value = draft.trim();
    if (!value || taken.has(value.toLowerCase())) {
      setDraft("");
      return;
    }
    setEntries((prev) => [...prev, { name: value, description: "" }]);
    setDraft("");
  }

  function remove(index: number) {
    setEntries((prev) => prev.filter((_, i) => i !== index));
    setOpenIndex(null);
  }

  function setDescription(index: number, description: string) {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, description } : e)));
  }

  const unusedSuggestions = suggestions.filter((s) => !taken.has(s.trim().toLowerCase()));

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(entries)} />

      {entries.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {entries.map((entry, i) => {
            const open = openIndex === i;
            return (
              <span
                key={`${entry.name}-${i}`}
                className={clsx(
                  "inline-flex items-center gap-1.5 rounded-full border py-1 pl-3 pr-1.5 text-sm transition-colors",
                  open
                    ? "border-violet-400 bg-violet-50 text-violet-700"
                    : "border-[var(--border)] bg-[var(--surface)]",
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="max-w-[14rem] truncate"
                  title="Edit description"
                >
                  {entry.name}
                </button>
                {entry.description ? (
                  <span
                    className="size-1.5 shrink-0 rounded-full bg-violet-500"
                    title="Has a description"
                  />
                ) : null}
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label={`Remove ${entry.name}`}
                  className="grid size-5 shrink-0 place-items-center rounded-full text-[var(--muted)] hover:bg-grey-100 hover:text-red-600"
                >
                  <X className="size-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {openIndex !== null && entries[openIndex] && (
        <div className="mb-3 rounded-xl border border-violet-200 bg-violet-50/40 p-3">
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <span className="text-xs font-medium">
              Description — {entries[openIndex].name}
            </span>
            <button
              type="button"
              onClick={() => setOpenIndex(null)}
              className="text-xs text-[var(--muted)] hover:text-violet-600"
            >
              Done
            </button>
          </div>
          <Textarea
            rows={2}
            value={entries[openIndex].description ?? ""}
            onChange={(e) => setDescription(openIndex, e.target.value)}
            placeholder="Optional — what this covers, in a line or two."
          />
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={draft}
          list={listId}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // Enter adds the area rather than submitting the whole form —
            // otherwise typing a name and hitting Enter saves the record.
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="e.g. Site Selection"
        />
        <button
          type="button"
          onClick={add}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[var(--border)] px-3 text-sm font-medium transition-colors hover:border-violet-400 hover:text-violet-600"
        >
          <Plus className="size-4" />
          Add
        </button>
      </div>

      <datalist id={listId}>
        {unusedSuggestions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      {unusedSuggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-[var(--muted)]">Common:</span>
          {unusedSuggestions.slice(0, 6).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setEntries((prev) => [...prev, { name: s, description: "" }])}
              className="rounded-md bg-grey-100 px-2 py-0.5 text-[11px] text-grey-500 transition-colors hover:bg-violet-50 hover:text-violet-600"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
