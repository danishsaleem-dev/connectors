import { clsx } from "clsx";
import Link from "next/link";
import { site } from "@/lib/site";

/**
 * The real lockup (icon + wordmark + tagline), supplied as a single
 * transparent PNG at public/logo.png (600×192). Rendered as one image rather
 * than icon + typed text, so the exact brand typography is what ships, not an
 * approximation in a web font.
 *
 * `onDark` renders it in white via `brightness-0 invert` — a CSS filter, not a
 * second asset. brightness(0) turns every opaque pixel black regardless of its
 * original hue while preserving alpha, then invert(1) flips black to white,
 * so this works for the mark, the wordmark and the tagline in one pass.
 */
export function Logo({
  className,
  size = "md",
  onDark = false,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  onDark?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label={`${site.name} — home`}
      className={clsx("group inline-flex items-center", className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- fixed local
          asset, not a next/image candidate: unoptimized images.config already
          renders a plain <img>, and the intrinsic 600x192 ratio is fixed. */}
      <img
        src="/logo.png"
        alt={`${site.name} — ${site.tagline}`}
        className={clsx(
          "w-auto transition-transform duration-700 group-hover:scale-[1.03]",
          onDark && "brightness-0 invert",
          size === "sm" && "h-10",
          size === "md" && "h-14",
          size === "lg" && "h-20",
        )}
      />
    </Link>
  );
}
