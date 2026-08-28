"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui";
import { ActionForm } from "@/components/portal/ActionForm";
import { resetUserPassword, setUserPassword, type ActionState } from "@/lib/portal/actions";

const initialState: ActionState = { ok: false };

/** Compact enough to sit inline in a list row next to a role pill — the only
 * password-recovery path in the portal, so it needs to be reachable from
 * wherever an account shows up (Accounts, and an org's own Accounts panel).
 *
 * Two ways to change a password: auto-generate (the original path — a
 * random temp password, emailed if RESEND_API_KEY is set, shown inline
 * otherwise) or type one directly, for when the admin wants to hand
 * someone a specific password rather than relay a generated one. The
 * second is a toggle rather than always-visible, so the common case (an
 * account row) doesn't carry a permanent text field. */
export function ResetPasswordButton({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(resetUserPassword, initialState);
  const [settingPassword, setSettingPassword] = useState(false);

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
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
        <span className="text-xs text-[var(--muted)]">·</span>
        <button
          type="button"
          onClick={() => setSettingPassword((v) => !v)}
          className="text-xs text-violet-600 underline underline-offset-4"
        >
          {settingPassword ? "Cancel" : "Set password"}
        </button>
      </div>

      {settingPassword && (
        <div className="w-48">
          <ActionForm
            action={setUserPassword}
            submitLabel="Save"
            pendingLabel="Saving…"
            successMessage="Password set."
            hiddenFields={{ userId }}
            layout="inline"
            size="sm"
          >
            <Input
              type="password"
              name="password"
              placeholder="New password"
              minLength={8}
              required
              className="w-32 py-1.5 text-xs"
            />
          </ActionForm>
        </div>
      )}

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
