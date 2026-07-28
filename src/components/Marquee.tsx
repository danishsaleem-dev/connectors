import { clsx } from "clsx";
import type { ReactNode } from "react";

/**
 * Infinite horizontal scroller. The children are rendered twice and the track
 * translates by exactly -50%, so the second copy lands where the first began
 * and the loop is seamless. The duplicate is `aria-hidden` so screen readers
 * hear the list once.
 */
export function Marquee({
  children,
  duration = "40s",
  reverse = false,
  className,
}: {
  children: ReactNode;
  duration?: string;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "group relative flex overflow-hidden",
        // Fade the ends into the page rather than cutting items off mid-word.
        "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
        className,
      )}
    >
      <div
        className="animate-marquee flex w-max shrink-0 items-center motion-reduce:animate-none"
        style={
          {
            "--marquee-duration": duration,
            animationDirection: reverse ? "reverse" : undefined,
          } as React.CSSProperties
        }
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
