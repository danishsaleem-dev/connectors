"use client";

import { useActionState } from "react";
import { deleteUser, type ActionState } from "@/lib/portal/actions";

const initialState: ActionState = { ok: false };

/** Inline destructive action for the accounts list — a plain confirm() is
 * enough friction for removing a portal login, which is what every other
 * delete in the portal (consultants) also relies on. */
export function DeleteUserButton({ userId, name }: { userId: string; name: string }) {
  const [state, formAction, pending] = useActionState(deleteUser, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm(`Delete ${name}'s account? This can't be undone.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      <button
        type="submit"
        disabled={pending}
        className="text-xs text-red-600 underline underline-offset-4 disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      {state.error && <p className="mt-1 text-[11px] text-red-600">{state.error}</p>}
    </form>
  );
}
