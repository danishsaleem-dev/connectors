import { Check } from "lucide-react";

export function FormSuccess({
  title = "Request received.",
  body = "A member of our team will review this and get back to you within one business day.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600">
        <Check size={18} />
      </span>
      <div>
        <p className="font-display text-xl">{title}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">{body}</p>
      </div>
    </div>
  );
}
