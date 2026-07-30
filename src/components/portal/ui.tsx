import { clsx } from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Small shared surfaces for the dashboard. Every admin and participant page
 * is built from these, so the portal stays visually consistent without each
 * page restating the same border/padding classes.
 */

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={clsx(
        "rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6",
        className,
      )}
    >
      {(title || action) && (
        <div className="mb-5 flex items-center justify-between gap-4">
          {title && <h2 className="font-display text-lg">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number | string;
  href?: string;
}) {
  const body = (
    <>
      <p className="font-display text-3xl">{value}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">{label}</p>
    </>
  );
  const className =
    "block rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors";
  return href ? (
    <Link href={href} className={clsx(className, "hover:border-violet-400")}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

export function Pill({
  children,
  tone = "violet",
}: {
  children: ReactNode;
  tone?: "violet" | "neutral" | "green" | "amber";
}) {
  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-medium",
        tone === "violet" && "bg-violet-50 text-violet-600",
        tone === "neutral" && "bg-grey-100 text-grey-500",
        tone === "green" && "bg-green-50 text-green-700",
        tone === "amber" && "bg-amber-50 text-amber-700",
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-[var(--border)] px-5 py-8 text-center text-sm text-[var(--muted)]">
      {children}
    </p>
  );
}

/** A row in a list, optionally linking to a detail page. */
export function ListRow({
  href,
  title,
  meta,
  trailing,
}: {
  href?: string;
  title: ReactNode;
  meta?: ReactNode;
  trailing?: ReactNode;
}) {
  const inner = (
    <>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{title}</p>
        {meta && <p className="mt-0.5 truncate text-xs text-[var(--muted)]">{meta}</p>}
      </div>
      {trailing}
    </>
  );
  const className =
    "flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4";

  return href ? (
    <Link href={href} className={clsx(className, "transition-colors hover:border-violet-400")}>
      {inner}
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  );
}

/** Label/value pairs for detail pages. Skips empty values entirely so a
 * sparse profile doesn't render a wall of dashes. */
export function DetailList({
  items,
}: {
  items: { label: string; value: ReactNode }[];
}) {
  const present = items.filter(
    (i) => i.value !== null && i.value !== undefined && i.value !== "",
  );
  if (present.length === 0) {
    return <p className="text-sm text-[var(--muted)]">Nothing recorded yet.</p>;
  }
  return (
    <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
      {present.map((item) => (
        <div key={item.label}>
          <dt className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            {item.label}
          </dt>
          <dd className="mt-1 text-sm">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function formatMoney(
  amount: number | null | undefined,
  currency = "GBP",
) {
  if (amount == null) return null;
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function formatRange(
  min: number | null | undefined,
  max: number | null | undefined,
  currency = "GBP",
) {
  const lo = formatMoney(min, currency);
  const hi = formatMoney(max, currency);
  if (lo && hi) return `${lo} – ${hi}`;
  return lo ?? hi ?? null;
}
