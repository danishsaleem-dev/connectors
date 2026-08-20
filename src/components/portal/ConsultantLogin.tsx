"use client";

import { useActionState } from "react";
import { createConsultantLogin, type ActionState } from "@/lib/portal/actions";
import { ResetPasswordButton } from "@/components/portal/ResetPasswordButton";
import { Field, Input } from "@/components/ui";

const initialState: ActionState = { ok: false };

/**
 * Issues a portal login for a consultant the admin added by hand.
 *
 * Two states, because there are two ways a consultant row comes to exist: one
 * created from the admin form has no account behind it and needs one, while a
 * self-registered consultant already signed themselves up and only ever needs
 * a password reset.
 */
export function ConsultantLogin({
  consultantId,
  account,
}: {
  consultantId: string;
  /** The existing portal user, when this consultant already has one. */
  account: { id: string; email: string } | null;
}) {
  const [state, formAction, pending] = useActionState(createConsultantLogin, initialState);

  if (account) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{account.email}</p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            This consultant can sign in and edit their own profile.
          </p>
        </div>
        <ResetPasswordButton userId={account.id} />
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={consultantId} />
      <Field
        label="Email address"
        hint="They'll sign in with this"
      >
        <Input name="email" type="email" placeholder="name@example.com" required />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create login"}
      </button>

      {/* Shown once and never again — there's no way to read a hashed
          password back, so an admin who navigates away issues a new one
          with Reset password instead. */}
      {state.tempPassword && (
        <div className="rounded-xl bg-violet-50 p-3">
          <p className="text-xs text-[var(--muted)]">
            Temporary password — copy it now, it won&apos;t be shown again.
          </p>
          <code className="mt-1 block text-sm font-medium text-violet-700">
            {state.tempPassword}
          </code>
        </div>
      )}
      {state.ok && !state.tempPassword && (
        <p className="text-xs text-green-700">Login created — the details were emailed to them.</p>
      )}
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
