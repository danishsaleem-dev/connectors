import { clsx } from "clsx";

/** Fixed 3dp, so server and client stringify to identical attribute values. */
const round = (n: number) => Math.round(n * 1000) / 1000;

/**
 * The Connectors mark, generalised into a reusable backdrop.
 *
 * The logo's "O" is a wireframe sphere: a stack of meridian ellipses whose
 * width follows a cosine, so they bunch up at the edges and spread through the
 * middle. Rebuilding it as geometry rather than shipping the raster means it
 * scales to any size, inherits `currentColor`, and can be animated.
 *
 * Purely decorative and server-rendered — no client JS. Callers that want it to
 * move wrap it in a motion element or add the `.animate-orbit` class.
 */
export function OrbitField({
  count = 26,
  className,
  accent = true,
  strokeWidth = 0.35,
}: {
  /** Number of meridian lines. Higher reads denser and more delicate. */
  count?: number;
  className?: string;
  /** Draw the heavier violet crescent from the logo. */
  accent?: boolean;
  strokeWidth?: number;
}) {
  const r = 48;
  // i spans the half-turn 0..π, so rx sweeps full → 0 → full and the ellipses
  // land symmetrically about the vertical axis, exactly like the logo.
  //
  // Rounding is load-bearing, not cosmetic: Node and the browser stringify the
  // same IEEE double differently at full precision (…102144 vs …10215), so
  // unrounded values hydrate mismatched on every ellipse.
  const meridians = Array.from({ length: count }, (_, i) => {
    const theta = (i / (count - 1)) * Math.PI;
    return round(Math.abs(Math.cos(theta)) * r);
  });

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={clsx("pointer-events-none select-none", className)}
    >
      {/* Outer rim. */}
      <circle
        cx="50"
        cy="50"
        r={r}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        opacity="0.55"
      />
      {meridians.map((rx, i) => (
        <ellipse
          key={i}
          cx="50"
          cy="50"
          rx={rx}
          ry={r}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          // Fade the flattest meridians so the sphere reads round rather than
          // as a solid band down the centre.
          opacity={round(0.14 + (rx / r) * 0.34)}
        />
      ))}
      {accent && (
        <ellipse
          cx="50"
          cy="50"
          rx={r * 0.34}
          ry={r}
          stroke="currentColor"
          strokeWidth={strokeWidth * 3.2}
          opacity="0.9"
        />
      )}
    </svg>
  );
}
