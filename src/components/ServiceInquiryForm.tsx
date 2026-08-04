"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { Button, Field, Honeypot, Input, Textarea } from "@/components/ui";
import { submitQuickContact, type QuickContactState } from "@/lib/actions/contact";

const initialState: QuickContactState = { ok: false };

/**
 * Light-surface enquiry form for a specific page — the vendor service pages
 * use it to ask about one service. Deliberately separate from
 * QuickContactForm, which hardcodes dark-background field styling for the
 * CtaSection band and would need class overrides to work on white.
 *
 * `subject` rides along as a hidden field so the notification email says
 * which service the question is about.
 */
export function ServiceInquiryForm({
  subject,
  placeholder = "What would you like to know?",
}: {
  subject: string;
  placeholder?: string;
}) {
  const [state, formAction, pending] = useActionState(submitQuickContact, initialState);

  if (state.ok) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600">
          <Check size={16} />
        </span>
        <div>
          <p className="font-display text-lg">Message sent.</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            We read every message ourselves and reply within one business day.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-4">
      <Honeypot />
      <input type="hidden" name="subject" value={subject} />

      <Field label="Your name">
        <Input name="name" required autoComplete="name" />
      </Field>
      <Field label="Email">
        <Input type="email" name="email" required autoComplete="email" />
      </Field>
      <Field label="Message">
        <Textarea name="message" required minLength={10} rows={4} placeholder={placeholder} />
      </Field>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} showIcon={!pending} className="mt-1 w-full">
        {pending ? "Sending…" : "Send enquiry"}
      </Button>
    </form>
  );
}
