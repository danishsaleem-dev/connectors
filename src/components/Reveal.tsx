"use client";

import { motion, type Variants } from "motion/react";
import { Fragment, type ReactNode } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

const variants: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      delay: i * 0.08,
      ease,
    },
  }),
};

/** Fade-up on scroll-into-view. `i` staggers grouped children. */
export function Reveal({
  children,
  i = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  i?: number;
  className?: string;
  as?: "div" | "span" | "li" | "p" | "h2" | "h3" | "section" | "article";
}) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      variants={variants}
      custom={i}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </MotionTag>
  );
}

const wordContainer = (delay: number): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: delay } },
});

const wordChild: Variants = {
  hidden: { y: "110%" },
  show: { y: 0, transition: { duration: 0.9, ease } },
};

/**
 * Splits text into words that rise into place. A single IntersectionObserver
 * lives on the wrapper and staggers its children — reliable, unlike one
 * observer per word (which can fire inconsistently and leave text clipped).
 */
export function RevealText({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const words = text.split(" ");
  return (
    <motion.span
      className={className}
      variants={wordContainer(delay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="inline-flex overflow-hidden align-bottom">
            <motion.span className="inline-block" variants={wordChild}>
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </motion.span>
  );
}
