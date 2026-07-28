"use client";

import { ReactLenis } from "lenis/react";
import { useEffect, useState, type ReactNode } from "react";

/**
 * Lenis-driven smooth scrolling, mounted once at the root.
 *
 * Two things worth knowing:
 *  - `root` makes Lenis drive the document scroller, so it renders no wrapper
 *    element and swapping it in after mount doesn't disturb layout.
 *  - It starts disabled and turns on after mount. Reading the media query
 *    during render would either mismatch the server HTML or force us to guess;
 *    hijacking the scroll of someone who asked for reduced motion is worse than
 *    a frame of native scrolling.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(!query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  if (!enabled) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.09,
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1,
      }}
    >
      {children}
    </ReactLenis>
  );
}
