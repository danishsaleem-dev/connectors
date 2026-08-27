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
  /** Wrapper for each panel's content. Defaults to the two-column field
   * grid a form wants; page-level tabs pass their own (see PageTabs). */
  contentClassName = "grid gap-4 sm:grid-cols-2",
}: {
  sections: { id: string; label: string; badge?: number; content: ReactNode }[];
  contentClassName?: string;
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
          <div className={contentClassName}>{section.content}</div>
        </div>
      ))}
    </div>
  );
}

/**
 * The same tab strip for a *page* rather than a form — the org detail page
 * carries seven independent sections (details, accounts, properties,
 * requests, franchise opportunities, documents, messages), which as one
 * vertical stack is a very long scroll where unrelated panels of wildly
 * different heights sit beside each other.
 *
 * Panels here are still hidden rather than unmounted: several contain their
 * own forms with half-typed input, and switching tabs shouldn't discard it.
 */
export function PageTabs({
  sections,
}: {
  sections: { id: string; label: string; badge?: number; content: ReactNode }[];
}) {
  return <FormSections sections={sections} contentClassName="" />;
}
