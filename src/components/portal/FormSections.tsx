"use client";

import { useState } from "react";
import { clsx } from "clsx";
import type { ReactNode } from "react";

/**
 * Tabs for a long single-submit form.
 *
 * Inactive panels are hidden with CSS, never unmounted — the whole point is
 * that one Save still submits every field, including ones on tabs the admin
 * never opened. Unmounting would silently drop them from FormData and wipe
 * values on save, which is a far worse bug than a long page.
 *
 * `hidden` on the wrapper also keeps hidden panels out of the accessibility
 * tree and out of tab order, so keyboard focus doesn't wander into an
 * invisible section.
 */
export function FormSections({
  sections,
}: {
  sections: { id: string; label: string; badge?: number; content: ReactNode }[];
}) {
  const [active, setActive] = useState(sections[0]?.id);

  return (
    <div>
      <div className="-mx-5 mb-6 overflow-x-auto border-b border-[var(--border)] px-5 sm:-mx-6 sm:px-6">
        <div className="flex min-w-max gap-1">
          {sections.map((section) => {
            const isActive = section.id === active;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActive(section.id)}
                aria-current={isActive ? "true" : undefined}
                className={clsx(
                  "relative shrink-0 whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "text-violet-600 after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-violet-600"
                    : "text-[var(--muted)] hover:text-[var(--foreground,inherit)]",
                )}
              >
                {section.label}
                {section.badge != null && section.badge > 0 && (
                  <span className="ml-1.5 rounded-full bg-grey-100 px-1.5 py-0.5 text-[10px] text-grey-500">
                    {section.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.id} hidden={section.id !== active}>
          <div className="grid gap-4 sm:grid-cols-2">{section.content}</div>
        </div>
      ))}
    </div>
  );
}
