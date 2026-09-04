"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui";

/**
 * Plain-string chip input — same interaction as ExpertiseEditor, minus the
 * per-tag description panel. Used for industries, where a tag is just a
 * label with nothing else to attach to it.
 *
 * Serializes as one hidden input per tag, all sharing `name` — the server
 * action reads them with the `list()` helper's formData.getAll(key), no
 * JSON parsing needed.
 */
export function TagsEditor({
  name,
  initial = [],
  suggestions = [],
  placeholder = "e.g. Food & Beverage",
}: {
  name: string;
  initial?: string[];
  suggestions?: string[];
  placeholder?: string;
}) {
  const [tags, setTags] = useState<string[]>(initial);
  const [draft, setDraft] = useState("");

  const listId = `${name}-suggestions`;
  const taken = new Set(tags.map((t) => t.trim().toLowerCase()));

  function add(value: string) {
    const trimmed = value.trim();
    if (!trimmed || taken.has(trimmed.toLowerCase())) {
      setDraft("");
      return;
    }
    setTags((prev) => [...prev, trimmed]);
    setDraft("");
  }

  function remove(index: number) {
    setTags((prev) => prev.filter((_, i) => i !== index));
  }

  const unusedSuggestions = suggestions.filter((s) => !taken.has(s.trim().toLowerCase()));

  return (
    <div>
      {tags.map((tag, i) => (
        <input key={`${tag}-${i}`} type="hidden" name={name} value={tag} />
      ))}

      {tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <span
              key={`${tag}-${i}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] py-1 pl-3 pr-1.5 text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`Remove ${tag}`}
                className="grid size-5 shrink-0 place-items-center rounded-full text-[var(--muted)] hover:bg-grey-100 hover:text-red-600"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={draft}
          list={listId}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(draft);
            }
          }}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => add(draft)}
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
              onClick={() => add(s)}
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
