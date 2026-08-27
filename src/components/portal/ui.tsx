import { clsx } from "clsx";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";

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
  bodyClassName,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Lets a panel host a flush list (rows to the panel edge) instead of the
   * default padded body. */
  bodyClassName?: string;
}) {
  return (
    <section
      className={clsx(
        "rounded-2xl border border-[var(--border)] bg-[var(--surface)]",
        className,
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-5 py-4 sm:px-6">
          {title && <h2 className="font-display text-base sm:text-lg">{title}</h2>}
          {action}
        </div>
      )}
      <div className={bodyClassName ?? "p-5 sm:p-6"}>{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  href,
  icon: Icon,
  hint,
}: {
  label: string;
  value: number | string;
  href?: string;
  icon?: ComponentType<{ className?: string }>;
  /** A short qualifier under the label — "3 awaiting reply", "this week". */
  hint?: string;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-2xl leading-none sm:text-3xl">{value}</p>
        {Icon && (
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-600">
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <p className="mt-3 text-sm font-medium">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-[var(--muted)]">{hint}</p>}
    </>
  );
  const className =
    "block rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors sm:p-5";
  return href ? (
    <Link href={href} className={clsx(className, "hover:border-violet-400")}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

/** A labelled band between sections — used where a page has more than one
 * list and the panels alone don't make the split obvious. */
export function SectionHeading({
  title,
  action,
  className,
}: {
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("mb-3 flex items-end justify-between gap-4", className)}>
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
        {title}
      </h2>
      {action}
    </div>
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

/**
 * The listing-page row.
 *
 * One component rather than a `<table>` because the admin is used on a
 * phone as much as a laptop: a table either scrolls sideways or crushes its
 * columns at that width. This lays out as a stacked card under `md` and as
 * an aligned row above it, so the same markup reads correctly at both ends
 * without a horizontal scrollbar.
 *
 * `facts` are the secondary columns — they sit inline on desktop and wrap
 * to labelled chips on mobile. Empty ones are dropped rather than rendered
 * as blanks, so a sparse record just shows less.
 */
export function RecordRow({
  href,
  title,
  subtitle,
  leading,
  facts = [],
  status,
  actions,
}: {
  href?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Avatar, thumbnail or icon. */
  leading?: ReactNode;
  facts?: { label: string; value: ReactNode }[];
  status?: ReactNode;
  /** Inline controls. Rendered outside the link so buttons inside a row
   * don't trigger navigation. */
  actions?: ReactNode;
}) {
  const present = facts.filter(
    (f) => f.value !== null && f.value !== undefined && f.value !== "",
  );

  const identity = (
    <div className="flex min-w-0 items-center gap-3">
      {leading}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{title}</p>
        {subtitle && (
          <p className="mt-0.5 truncate text-xs text-[var(--muted)]">{subtitle}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-3 border-b border-[var(--border)] px-5 py-4 last:border-0 transition-colors hover:bg-[var(--surface-hover,rgba(0,0,0,0.015))] md:flex-row md:items-center md:gap-4 sm:px-6">
      <div className="min-w-0 md:flex-1">
        {href ? (
          <Link href={href} className="block hover:text-violet-600">
            {identity}
          </Link>
        ) : (
          identity
        )}
      </div>

      {present.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 md:w-auto md:shrink-0 md:justify-end">
          {present.map((fact) => (
            <div key={fact.label} className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
                {fact.label}
              </p>
              <p className="truncate text-xs font-medium">{fact.value}</p>
            </div>
          ))}
        </div>
      )}

      {(status || actions) && (
        <div className="flex shrink-0 items-center gap-2 md:justify-end">
          {status}
          {actions}
        </div>
      )}
    </div>
  );
}

/** Wraps [RecordRow]s so the group reads as one bordered surface, with the
 * dividers coming from the rows themselves. */
export function RecordList({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      {children}
    </div>
  );
}

/** A compact run of tags — expertise, categories, industries. Caps what it
 * shows so one heavily-tagged record can't blow out the row height, and
 * reports the remainder instead. */
export function TagRun({ items, max = 3 }: { items: string[]; max?: number }) {
  if (items.length === 0) return null;
  const shown = items.slice(0, max);
  const rest = items.length - shown.length;
  return (
    <span className="flex flex-wrap items-center gap-1">
      {shown.map((item) => (
        <span
          key={item}
          className="inline-flex items-center rounded-md bg-grey-100 px-2 py-0.5 text-[11px] text-grey-500"
        >
          {item}
        </span>
      ))}
      {rest > 0 && <span className="text-[11px] text-[var(--muted)]">+{rest}</span>}
    </span>
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
