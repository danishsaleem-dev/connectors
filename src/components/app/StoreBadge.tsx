import { clsx } from "clsx";
import type { ReactNode } from "react";

/**
 * App Store / Google Play buttons, hand-built rather than the official badge
 * artwork (avoids shipping trademarked assets we don't have a license for).
 * Renders as a disabled "coming soon" pill whenever the configured link in
 * `site.appLinks` is still the "#" placeholder.
 */
export function StoreBadge({
  href,
  icon,
  eyebrow,
  label,
}: {
  href: string;
  icon: ReactNode;
  eyebrow: string;
  label: string;
}) {
  const comingSoon = href === "#";

  const inner = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
        {icon}
      </span>
      <span className="text-left leading-tight">
        <span className="block text-[10px] text-white/60">
          {comingSoon ? "Coming soon to" : eyebrow}
        </span>
        <span className="block text-sm font-medium text-white">{label}</span>
      </span>
    </>
  );

  const className = clsx(
    "inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/[0.06] px-4 py-2.5 transition-colors",
    comingSoon ? "opacity-70 cursor-default" : "hover:border-white/40 hover:bg-white/10",
  );

  if (comingSoon) {
    return (
      <span className={className} aria-disabled="true">
        {inner}
      </span>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {inner}
    </a>
  );
}
