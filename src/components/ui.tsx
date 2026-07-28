import { clsx } from "clsx";
import Link from "next/link";
import { ArrowUpRight, Check, type LucideIcon } from "lucide-react";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

/**
 * Hand-rolled primitives — no shadcn, no CVA, matching the house style.
 *
 * Deliberately not marked "use client": none of these hold state, so they
 * render on the server. A caller that passes `onClick` is itself a Client
 * Component, which is where the boundary belongs.
 */

/* ------------------------------------------------------------------ */
/*  Buttons                                                            */
/*                                                                      */
/*  Filled/bordered variants render a pill with a leading label and a  */
/*  circular icon that starts docked at the trailing edge and slides   */
/*  the full width of the button on hover, rotating 45° as it settles  */
/*  at the leading edge. `ghost` is untouched — a plain text-tint      */
/*  action with no pill, no fixed height, no icon.                     */
/* ------------------------------------------------------------------ */

type ButtonVariant = "primary" | "secondary" | "ghost" | "onDark" | "outline";
type ButtonSize = "sm" | "md" | "lg";

const PILL_FILL: Record<Exclude<ButtonVariant, "ghost">, string> = {
  primary:
    "bg-violet-600 text-white hover:bg-violet-700 hover:shadow-[0_18px_40px_-18px_var(--color-violet-600)]",
  secondary:
    "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-violet-400",
  onDark: "bg-white text-ink hover:shadow-[0_18px_40px_-18px_rgba(255,255,255,0.55)]",
  // Transparent pill for sitting on a photograph or dark section.
  outline:
    "border border-white/30 bg-transparent text-white backdrop-blur-sm hover:border-white/70 hover:bg-white/10",
};

/** The circle always contrasts against its own button fill, not the page. */
const PILL_CIRCLE: Record<Exclude<ButtonVariant, "ghost">, string> = {
  primary: "bg-white text-violet-600",
  secondary: "bg-violet-600 text-white",
  onDark: "bg-ink text-white",
  outline: "bg-white/15 text-white",
};

const PILL_SIZE: Record<
  ButtonSize,
  {
    height: string;
    text: string;
    ps: string;
    pe: string;
    circle: string;
    /** Distance the circle travels — (circle diameter + inset) as a rem value. */
    travel: string;
    icon: number;
  }
> = {
  sm: {
    height: "h-10",
    text: "text-[13px]",
    ps: "ps-4",
    pe: "pe-11",
    circle: "h-8 w-8",
    travel: "right-[calc(100%-2.25rem)]",
    icon: 14,
  },
  md: {
    height: "h-12",
    text: "text-sm",
    ps: "ps-6",
    pe: "pe-14",
    circle: "h-10 w-10",
    travel: "right-[calc(100%-2.75rem)]",
    icon: 16,
  },
  lg: {
    height: "h-14",
    text: "text-[15px]",
    ps: "ps-7",
    pe: "pe-16",
    // Circle is 2.75rem (h-11/w-11); travel = circle + 0.25rem inset = 3rem,
    // so the hover-left inset mirrors the rest-state right inset exactly.
    circle: "h-11 w-11",
    travel: "right-[calc(100%-3rem)]",
    icon: 18,
  },
};

const GHOST_SIZE: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-[13px]",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-[15px]",
};

function pillClasses(
  variant: Exclude<ButtonVariant, "ghost">,
  size: ButtonSize,
  className?: string,
) {
  const s = PILL_SIZE[size];
  return clsx(
    "group relative inline-flex w-fit items-center justify-center overflow-hidden rounded-full p-1 font-medium tracking-tight transition-all duration-500 disabled:pointer-events-none disabled:opacity-50",
    s.height,
    s.text,
    s.ps,
    s.pe,
    PILL_FILL[variant],
    className,
  );
}

/** Swap-side padding pairs per size — kept as data so hover matches rest state exactly. */
const HOVER_SWAP: Record<ButtonSize, string> = {
  sm: "group-hover:ps-11 group-hover:pe-4",
  md: "group-hover:ps-14 group-hover:pe-6",
  lg: "group-hover:ps-16 group-hover:pe-7",
};

function PillIcon({
  variant,
  size,
  icon: Icon = ArrowUpRight,
}: {
  variant: Exclude<ButtonVariant, "ghost">;
  size: ButtonSize;
  icon?: LucideIcon;
}) {
  const s = PILL_SIZE[size];
  return (
    <span
      aria-hidden="true"
      className={clsx(
        "absolute top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full transition-all duration-500 group-hover:rotate-45",
        s.circle,
        s.travel.replace("right-", "group-hover:right-"),
        "right-1",
        PILL_CIRCLE[variant],
      )}
    >
      <Icon size={s.icon} />
    </span>
  );
}

type PillProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  /** Suppress the sliding icon and render a plain centred pill. */
  showIcon?: boolean;
  className?: string;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  showIcon = true,
  className,
  children,
  ...props
}: PillProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  if (variant === "ghost") {
    return (
      <button
        className={clsx(
          "rounded-full font-medium tracking-tight text-[var(--muted)] transition-colors duration-300 hover:bg-violet-600/[0.06] hover:text-violet-600 disabled:pointer-events-none disabled:opacity-50",
          GHOST_SIZE[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
  return (
    <button className={clsx(pillClasses(variant, size, className), HOVER_SWAP[size])} {...props}>
      <span className="relative z-10">{children}</span>
      {showIcon && <PillIcon variant={variant} size={size} icon={icon} />}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  icon,
  showIcon = true,
  className,
  children,
  external,
}: PillProps & { href: string; external?: boolean }) {
  if (variant === "ghost") {
    const styles = clsx(
      "inline-block rounded-full font-medium tracking-tight text-[var(--muted)] transition-colors duration-300 hover:bg-violet-600/[0.06] hover:text-violet-600",
      GHOST_SIZE[size],
      className,
    );
    return external ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className={styles}>
        {children}
      </a>
    ) : (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  const styles = clsx(pillClasses(variant, size, className), HOVER_SWAP[size]);
  const content = (
    <>
      <span className="relative z-10">{children}</span>
      {showIcon && <PillIcon variant={variant} size={size} icon={icon} />}
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={styles}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={styles}>
      {content}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Surfaces                                                           */
/* ------------------------------------------------------------------ */

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Standard vertical rhythm + page gutter for a top-level page section. */
export function Section({
  children,
  className,
  id,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: "default" | "sunken" | "dark";
}) {
  return (
    <section
      id={id}
      className={clsx(
        "relative py-20 md:py-28",
        tone === "sunken" && "bg-[var(--surface-sunken)]",
        tone === "dark" && "bg-ink text-white",
        className,
      )}
    >
      <div className="shell">{children}</div>
    </section>
  );
}

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={clsx("eyebrow", className)}>{children}</p>;
}

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border border-violet-600/20 bg-violet-600/[0.07] px-3 py-1 text-xs font-medium text-violet-600",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Form controls                                                      */
/* ------------------------------------------------------------------ */

export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label?: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={clsx("block", className)}>
      {label && (
        <span className="mb-1.5 flex items-baseline justify-between gap-3 text-[13px] font-medium text-[var(--foreground)]">
          <span>
            {label}
            {required && (
              <span className="ml-0.5 text-violet-400" aria-hidden="true">
                *
              </span>
            )}
          </span>
          {hint && (
            <span className="text-xs font-normal text-[var(--muted)]">{hint}</span>
          )}
        </span>
      )}
      {children}
      {error && (
        <span className="mt-1.5 block text-xs text-red-600 dark:text-red-400">
          {error}
        </span>
      )}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)]/60 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx(inputCls, className)} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props} className={clsx(inputCls, "min-h-28 resize-y", className)} />
  );
}

export function Select({
  children,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={clsx(inputCls, "cursor-pointer", className)}>
      {children}
    </select>
  );
}

/**
 * Unchecked state relies on the tick being white against a white/`--surface`
 * box — invisible by color match rather than an explicit opacity toggle,
 * which sidesteps a real Tailwind limitation: `peer-checked:` only applies to
 * a direct sibling of the input, not a descendant nested inside one.
 */
export function Checkbox({
  label,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <label
      className={clsx(
        "flex cursor-pointer items-start gap-2.5 text-sm leading-tight",
        className,
      )}
    >
      <input type="checkbox" className="peer sr-only" {...props} />
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] transition-colors peer-checked:border-violet-600 peer-checked:bg-violet-600 peer-focus-visible:ring-2 peer-focus-visible:ring-violet-400/30">
        <Check size={13} className="text-white" />
      </span>
      <span className="text-[var(--foreground)]">{label}</span>
    </label>
  );
}

/** Same background-match trick as Checkbox, applied to the inner dot via a
 * chained `[&>span]` selector on the outer ring (a direct sibling of the
 * input), since the dot itself is one level too deep for `peer-checked:`. */
export function Radio({
  label,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <label className={clsx("flex cursor-pointer items-center gap-2.5 text-sm", className)}>
      <input type="radio" className="peer sr-only" {...props} />
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] transition-colors peer-checked:border-violet-600 peer-focus-visible:ring-2 peer-focus-visible:ring-violet-400/30 peer-checked:[&>span]:opacity-100">
        <span className="h-2.5 w-2.5 rounded-full bg-violet-600 opacity-0 transition-opacity" />
      </span>
      <span className="text-[var(--foreground)]">{label}</span>
    </label>
  );
}

/** Native file input, restyled via the `file:` pseudo-element variant. */
export function FileInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="file"
      className={clsx(
        "block w-full text-sm text-[var(--muted)] file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-violet-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-violet-600 hover:file:bg-violet-100",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Spam trap. Bots fill every field they can see in the DOM; a real user never
 * touches this one. Hidden with position + opacity rather than `display:none`
 * or `type="hidden"`, both of which some bots specifically skip.
 */
export function Honeypot() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-[-9999px] h-0 w-0 overflow-hidden opacity-0"
    >
      <label htmlFor="company-website">Company website</label>
      <input
        id="company-website"
        name="company_website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}
