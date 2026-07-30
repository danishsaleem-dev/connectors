import { clsx } from "clsx";
import { Textarea } from "@/components/ui";
import { ActionForm } from "@/components/portal/ActionForm";
import type { ActionState } from "@/lib/portal/actions";

type Message = {
  id: string;
  authorName: string;
  authorIsAdmin: boolean;
  body: string;
  createdAt: Date;
};

/**
 * A single thread between Connectors and one organization — used for the
 * general org thread and, on deal pages, for each side separately. It never
 * receives both sides' messages at once; the caller's query filters them.
 */
export function MessageThread({
  messages,
  action,
  hiddenFields,
  placeholder = "Write a message…",
  emptyLabel = "No messages yet.",
}: {
  messages: Message[];
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  hiddenFields?: Record<string, string | undefined>;
  placeholder?: string;
  emptyLabel?: string;
}) {
  return (
    <div>
      <div className="max-h-80 space-y-4 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        {messages.length === 0 && <p className="text-sm text-[var(--muted)]">{emptyLabel}</p>}
        {messages.map((m) => (
          <div key={m.id}>
            <p className="text-xs text-[var(--muted)]">
              <span
                className={clsx("font-medium", m.authorIsAdmin && "text-violet-600")}
              >
                {m.authorName}
              </span>{" "}
              · {new Date(m.createdAt).toLocaleString()}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{m.body}</p>
          </div>
        ))}
      </div>

      <ActionForm
        action={action}
        hiddenFields={hiddenFields}
        submitLabel="Send"
        pendingLabel="Sending…"
        successMessage="Sent."
        size="sm"
        className="mt-4"
      >
        <div className="sm:col-span-2">
          <Textarea name="body" required rows={2} placeholder={placeholder} />
        </div>
      </ActionForm>
    </div>
  );
}
