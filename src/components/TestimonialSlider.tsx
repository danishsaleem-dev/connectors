"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { VideoEmbed } from "@/components/VideoEmbed";

const ease = [0.16, 1, 0.3, 1] as const;

/** Defined here rather than in a page's content file — this slider is
 * reused across pages (consultants, for-franchise, …), each with its own
 * content module, so the shape it expects belongs with the component. */
export type TestimonialWithVideo = {
  quote: string;
  role: string;
  company: string;
  /** A YouTube/Vimeo link or a direct video file URL. Null renders a
   * "coming soon" placeholder via VideoEmbed rather than a dead player. */
  videoUrl: string | null;
};

/** Quote on the left, that quote's video on the right — the two columns move
 * together, so the video always belongs to the testimonial being read. */
export function TestimonialSlider({ items }: { items: TestimonialWithVideo[] }) {
  const [index, setIndex] = useState(0);
  if (items.length === 0) return null;

  const active = items[index];
  const go = (delta: number) => setIndex((i) => (i + delta + items.length) % items.length);

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
      <div>
        <AnimatePresence mode="wait">
          <motion.figure
            key={active.company}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease }}
          >
            <Quote size={26} className="text-violet-400/60" aria-hidden="true" />
            <blockquote className="font-display mt-5 text-xl leading-snug text-balance sm:text-2xl">
              “{active.quote}”
            </blockquote>
            <figcaption className="mt-6 text-sm">
              <span className="block font-medium">{active.role}</span>
              <span className="text-[var(--muted)]">{active.company}</span>
            </figcaption>
          </motion.figure>
        </AnimatePresence>

        <div className="mt-8 flex items-center gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous testimonial"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] transition-colors hover:border-violet-400 hover:text-violet-600"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next testimonial"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] transition-colors hover:border-violet-400 hover:text-violet-600"
          >
            <ChevronRight size={16} />
          </button>

          <div className="ml-2 flex gap-2">
            {items.map((item, i) => (
              <button
                key={item.company}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Testimonial ${i + 1}`}
                aria-current={i === index}
                className={clsx(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === index ? "w-6 bg-violet-600" : "w-1.5 bg-[var(--border)]",
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <VideoEmbed url={active.videoUrl} title={`${active.company} testimonial`} />
    </div>
  );
}
