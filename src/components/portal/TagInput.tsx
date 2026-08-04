"use client";

import { useMemo, useState } from "react";
import { clsx } from "clsx";
import { X } from "lucide-react";

/**
 * Pill-based multi-value input — Enter (or typing a comma) commits the
 * current text as a tag, pasting a comma-separated blob splits it into
 * several tags at once, and typing shows autocomplete suggestions drawn
 * from values already used elsewhere in the system (so "Site Selection"
 * doesn't quietly fork into "site selection" / "Site-Selection" variants
 * across different consultants).
 *
 * Serializes to one hidden input as a comma-joined string — the server
 * action's existing `list()` helper already splits on comma/newline, so
 * saveConsultant needed no changes to read this the same way it read the
 * old plain-text field.
 */
export function TagInput({
  name,
  initial = [],
  suggestions = [],
  placeholder = "Type and press Enter…",
}: {
  name: string;
  initial?: string[];
  suggestions?: string[];
  placeholder?: string;
}) {
  const [tags, setTags] = useState<string[]>(initial);
  const [inputValue, setInputValue] = useState("");
  const [focused, setFocused] = useState(false);

  function addTag(raw: string) {
    const value = raw.trim();
    if (!value) return;
    setTags((prev) => (prev.some((t) => t.toLowerCase() === value.toLowerCase()) ? prev : [...prev, value]));
  }

  function commitFromInput(raw: string) {
    raw
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach(addTag);
    setInputValue("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  const suggestionMatches = useMemo(() => {
    if (!inputValue.trim()) return [];
    const query = inputValue.trim().toLowerCase();
    const taken = new Set(tags.map((t) => t.toLowerCase()));
    return suggestions
      .filter((s) => !taken.has(s.toLowerCase()) && s.toLowerCase().includes(query))
      .slice(0, 6);
  }, [inputValue, suggestions, tags]);

  return (
    <div className="relative">
      <input type="hidden" name={name} value={tags.join(",")} />

      <div
        className={clsx(
          "flex flex-wrap items-center gap-1.5 rounded-xl border bg-[var(--surface)] p-2 transition-colors",
          focused ? "border-violet-400" : "border-[var(--border)]",
        )}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-violet-50 py-1 pl-3 pr-1.5 text-sm text-violet-600"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
              className="flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-violet-100"
            >
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          placeholder={tags.length === 0 ? placeholder : undefined}
          onChange={(e) => {
            const value = e.target.value;
            // A comma typed directly (not pasted) commits immediately too,
            // matching how pasted lists behave.
            if (value.endsWith(",")) {
              commitFromInput(value);
            } else {
              setInputValue(value);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitFromInput(inputValue);
            } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
              setTags((prev) => prev.slice(0, -1));
            }
          }}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text");
            if (text.includes(",") || text.includes("\n")) {
              e.preventDefault();
              commitFromInput(text);
            }
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            // Delay so a click on a suggestion registers before the list
            // disappears.
            setTimeout(() => setFocused(false), 120);
            if (inputValue.trim()) commitFromInput(inputValue);
          }}
          className="min-w-[9rem] flex-1 bg-transparent px-1.5 py-1 text-sm outline-none placeholder:text-[var(--muted)]"
        />
      </div>

      {focused && suggestionMatches.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_16px_40px_-16px_rgba(20,20,26,0.25)]">
          {suggestionMatches.map((s) => (
            <button
              key={s}
              type="button"
              // Prevents the text input from blurring at all when a
              // suggestion is clicked — without this, blur's own commit
              // logic (below) fires first and adds the raw typed text as
              // its own tag before this handler gets a chance to run.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                addTag(s);
                setInputValue("");
              }}
              className="block w-full px-3.5 py-2 text-left text-sm transition-colors hover:bg-violet-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
