"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { photoSrcSet, photoUrl, type Photo as PhotoData } from "@/lib/images";

const SLIDE_MS = 7000;
const CROSSFADE_S = 1.4;

/**
 * Auto-advancing hero background. Each photo does a slow Ken Burns zoom for
 * the length of its slide, crossfading into the next. `prefers-reduced-motion`
 * freezes on the first photo with no zoom and no autoplay.
 *
 * The zoom is a plain CSS `@keyframes` animation (.animate-kenburns in
 * globals.css) rather than a Framer Motion `animate` value, so it keeps
 * working identically regardless of how the crossfade is implemented, and is
 * naturally neutralised by the site-wide `prefers-reduced-motion` CSS rule as
 * a backstop alongside the JS-level early return below.
 *
 * Sits inside the caller's own scroll-parallax wrapper — this component only
 * owns the per-slide zoom/crossfade, not the outer scroll-linked transform.
 */
export function HeroSlideshow({ photos }: { photos: PhotoData[] }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  // Warm the browser cache for every slide up front so later crossfades never
  // show a blank frame while the image is still being fetched.
  useEffect(() => {
    photos.slice(1).forEach((p) => {
      const img = new window.Image();
      img.src = photoUrl(p.id, 2400);
    });
  }, [photos]);

  useEffect(() => {
    if (reduceMotion || photos.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % photos.length);
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, [reduceMotion, photos.length]);

  const current = photos[index];

  if (reduceMotion) {
    return (
      <img
        src={photoUrl(current.id, 2400)}
        srcSet={photoSrcSet(current.id)}
        sizes="100vw"
        alt={current.alt}
        loading="eager"
        decoding="sync"
        fetchPriority="high"
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <AnimatePresence>
      <motion.img
        key={current.id}
        src={photoUrl(current.id, 2400)}
        srcSet={photoSrcSet(current.id)}
        sizes="100vw"
        alt={current.alt}
        loading={index === 0 ? "eager" : "lazy"}
        decoding={index === 0 ? "sync" : "async"}
        fetchPriority={index === 0 ? "high" : "auto"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: CROSSFADE_S, ease: "easeInOut" }}
        style={{ ["--kenburns-duration" as string]: `${SLIDE_MS / 1000 + CROSSFADE_S}s` }}
        className="absolute inset-0 h-full w-full object-cover animate-kenburns"
      />
    </AnimatePresence>
  );
}
