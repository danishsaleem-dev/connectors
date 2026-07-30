"use client";

import { useActionState } from "react";
import { resetUserPassword, type ActionState } from "@/lib/portal/actions";

const initialState: ActionState = { ok: false };

/** Compact enough to sit inline in a list row next to a role pill — the only
 * password-recovery path in the portal, so it needs to be reachable from
 * wherever an account shows up (Accounts, and an org's own Accounts panel). */
export function ResetPasswordButton({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(resetUserPassword, initialState);

  return (
    <div className="flex flex-col items-end gap-1">
      <form action={formAction}>
        <input type="hidden" name="userId" value={userId} />
        <button
          type="submit"
          disabled={pending}
          className="text-xs text-violet-600 underline underline-offset-4 disabled:opacity-50"
        >
          {pending ? "Resetting…" : "Reset password"}
        </button>
      </form>
      {state.tempPassword && (
        <code className="rounded bg-violet-50 px-1.5 py-0.5 text-[11px] text-violet-700">
          {state.tempPassword}
        </code>
      )}
      {state.ok && !state.tempPassword && (
        <span className="text-[11px] text-green-700">New password emailed.</span>
      )}
      {state.error && <span className="text-[11px] text-red-600">{state.error}</span>}
    </div>
  );
}
