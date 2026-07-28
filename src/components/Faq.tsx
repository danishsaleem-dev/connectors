"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import type { Faq } from "@/lib/content/faq";

const ease = [0.16, 1, 0.3, 1] as const;

/** Single-open accordion. Reusable — pass any Faq[] from any page. */
export function FaqList({ items }: { items: Faq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-6 py-5 text-left"
            >
              <span
                className={clsx(
                  "font-display text-lg transition-colors",
                  open && "text-violet-600",
                )}
              >
                {item.question}
              </span>
              <ChevronDown
                size={18}
                className={clsx(
                  "shrink-0 text-[var(--muted)] transition-transform duration-300",
                  open && "rotate-180 text-violet-600",
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease }}
                  className="overflow-hidden"
                >
                  <p className="pb-6 max-w-2xl leading-relaxed text-[var(--muted)] text-pretty">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
