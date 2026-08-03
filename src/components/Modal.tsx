"use client";

import { useEffect } from "react";
import { clsx } from "clsx";
import { X } from "lucide-react";

/** Shared overlay shell — esc to close, backdrop click to close, scroll
 * locked while open. Used by both the auth modal and the consultant
 * inquiry modal, so the close/lock plumbing exists in exactly one place. */
export function Modal({
  onClose,
  children,
  className,
}: {
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-ink/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          "relative my-8 w-full rounded-3xl bg-[var(--surface)] shadow-[0_40px_80px_-32px_rgba(20,20,26,0.5)]",
          className,
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--muted)] shadow-sm transition-colors hover:text-violet-600"
        >
          <X size={16} />
        </button>
        {children}
      </div>
    </div>
  );
}
