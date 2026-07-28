"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import { OrbitField } from "@/components/OrbitField";
import { RevealText } from "@/components/Reveal";
import { ButtonLink } from "@/components/ui";
import { photos } from "@/lib/images";
import { HeroSlideshow } from "./HeroSlideshow";

const ease = [0.16, 1, 0.3, 1] as const;

// One image per rotation is enough variety without feeling like a carousel —
// mall atrium, boutique interior, dining, office towers each speak to a
// different audience the hero copy addresses.
const HERO_PHOTOS = [photos.mall, photos.boutique, photos.restaurant, photos.towers];

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // The photo drifts slower than the page — the standard parallax trick, kept
  // shallow so it reads as depth rather than as an effect.
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const photoScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.16]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "38%"]);
  const contentFade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative isolate min-h-[94svh] overflow-hidden">
      {/* Photograph — auto-advancing Ken Burns slideshow, riding the same
          scroll-linked parallax as a single photo would. */}
      <motion.div
        style={reduceMotion ? undefined : { y: photoY, scale: photoScale }}
        className="absolute inset-0 -z-20 overflow-hidden"
      >
        <HeroSlideshow photos={HERO_PHOTOS} />
      </motion.div>

      {/* Scrim. Two layers: a directional wash for type legibility on the left,
          and a floor gradient so the section resolves into the white page. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/90 via-ink/70 to-ink/30"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-[var(--background)] to-transparent"
      />

      {/* The logo motif, small and in the corner — an accent, not a wash. */}
      <OrbitField
        count={22}
        strokeWidth={0.3}
        className="animate-orbit absolute -right-24 top-1/2 -z-10 h-[32rem] w-[32rem] -translate-y-1/2 text-white/15"
      />

      <motion.div
        style={reduceMotion ? undefined : { y: contentY, opacity: contentFade }}
        className="shell relative flex min-h-[94svh] flex-col justify-center pt-32 pb-24"
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.1 }}
          className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/60"
        >
          Business expansion · Franchise development · Retail leasing
        </motion.p>

        <h1 className="font-display display-lg mt-6 max-w-3xl text-balance text-white">
          <RevealText text="Connecting brands, investors," delay={0.15} />{" "}
          <span className="italic text-violet-200">
            <RevealText text="franchisees & locations." delay={0.35} />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.6 }}
          className="mt-8 max-w-xl text-lg leading-relaxed text-white/75 text-pretty"
        >
          We are not consultants. We are growth partners — arranging the
          locations, the franchisees, the capital and the systems that turn one
          successful business into a network.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.75 }}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          <ButtonLink href="/for-brands" variant="onDark" size="lg">
            I have a brand to expand
          </ButtonLink>
          <ButtonLink href="/for-franchise" variant="outline" size="lg">
            I want a franchise
          </ButtonLink>
        </motion.div>

        {/* Audience shortcuts, sitting on the scrim's darker floor. */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/15 pt-6"
        >
          <a
            href="#what-we-do"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/60 transition-colors hover:text-white"
          >
            <ArrowDown size={14} className="animate-float" />
            What we do
          </a>
          <span className="text-xs text-white/40">
            Also for landlords, mall owners &amp; investors
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
