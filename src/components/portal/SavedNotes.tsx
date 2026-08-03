import { getCurrentUser } from "@/lib/auth/current-user";
import { listNotes } from "@/lib/db/queries";
import { createNote, deleteNote } from "@/lib/portal/actions";
import { ActionForm } from "@/components/portal/ActionForm";
import { EmptyState, Panel } from "@/components/portal/ui";
import { Textarea } from "@/components/ui";

/**
 * The one panel every role's dashboard shares, admin included — a plain
 * scratchpad keyed on the account (not the organization), since admin has
 * no organization to key it on. Self-contained: reads the session itself,
 * so every dashboard page just drops in `<SavedNotes />` with no props.
 */
export async function SavedNotes() {
  const user = await getCurrentUser();
  if (!user) return null;

  const items = await listNotes(user.id);

  return (
    <Panel title="Saved notes" className="mt-6">
      <ActionForm
        action={createNote}
        submitLabel="Add note"
        pendingLabel="Saving…"
        successMessage="Saved."
      >
        <Textarea
          name="body"
          rows={2}
          placeholder="Jot something down for later…"
          required
          className="sm:col-span-2"
        />
      </ActionForm>

      <div className="mt-5 space-y-2">
        {items.length === 0 ? (
          <EmptyState>Nothing saved yet.</EmptyState>
        ) : (
          items.map((note) => (
            <div
              key={note.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
            >
              <p className="min-w-0 whitespace-pre-wrap text-sm">{note.body}</p>
              <ActionForm
                action={deleteNote}
                submitLabel="Remove"
                pendingLabel="…"
                successMessage="Removed."
                hiddenFields={{ id: note.id }}
                size="sm"
                variant="secondary"
                layout="inline"
              />
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}
