"use client";

import { useActionState } from "react";
import { clsx } from "clsx";
import { Button } from "@/components/ui";
import type { ActionState } from "@/lib/portal/actions";

const initialState: ActionState = { ok: false };

/**
 * The portal's only form component.
 *
 * Server Actions are passed in as props from Server Components, so every
 * form in the dashboard — profiles, properties, requests, deal stages,
 * messages — shares this one client boundary instead of each needing its own
 * `"use client"` file just to call `useActionState`.
 */
export function ActionForm({
  action,
  submitLabel,
  pendingLabel,
  successMessage = "Saved.",
  hiddenFields,
  children,
  className,
  submitClassName,
  size = "md",
  variant = "primary",
  layout = "stacked",
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  pendingLabel?: string;
  successMessage?: string;
  hiddenFields?: Record<string, string | undefined>;
  children?: React.ReactNode;
  className?: string;
  submitClassName?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary";
  /** "stacked" (default) is the multi-field form shape — fields in a 2-col
   * grid, the submit button on its own full-width row below. "inline" is for
   * a single-field list-row quick action — field and button side by side, one
   * line, no wasted row height. */
  layout?: "stacked" | "inline";
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const messages = (
    <>
      {state.tempPassword && (
        <p className="mt-3 text-sm text-violet-700">
          Account created. Temporary password (shown once — RESEND_API_KEY isn&apos;t set, so
          this wasn&apos;t emailed):{" "}
          <code className="rounded bg-violet-50 px-1.5 py-0.5">{state.tempPassword}</code>
        </p>
      )}
      {state.ok && !state.tempPassword && (
        <p className="mt-3 text-sm text-green-700">{successMessage}</p>
      )}
      {state.error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {state.error}
        </p>
      )}
    </>
  );

  const hidden =
    hiddenFields &&
    Object.entries(hiddenFields).map(([name, value]) =>
      value === undefined ? null : <input key={name} type="hidden" name={name} value={value} />,
    );

  if (layout === "inline") {
    return (
      <form action={formAction} className={clsx("flex flex-wrap items-center gap-2", className)}>
        {hidden}
        {children}
        <Button
          type="submit"
          size={size}
          variant={variant}
          disabled={pending}
          showIcon={!pending}
          className={submitClassName}
        >
          {pending ? (pendingLabel ?? "Saving…") : submitLabel}
        </Button>
        {(state.ok || state.error) && <div className="w-full">{messages}</div>}
      </form>
    );
  }

  return (
    <form action={formAction} className={clsx("grid gap-4 sm:grid-cols-2", className)}>
      {hidden}
      {children}

      <div className="sm:col-span-2">
        <Button
          type="submit"
          size={size}
          variant={variant}
          disabled={pending}
          showIcon={!pending}
          className={submitClassName}
        >
          {pending ? (pendingLabel ?? "Saving…") : submitLabel}
        </Button>
        {messages}
      </div>
    </form>
  );
}
