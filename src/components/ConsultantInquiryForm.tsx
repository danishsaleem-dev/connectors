"use client";

import { useActionState } from "react";
import { Button, Field, Honeypot, Input, Textarea } from "@/components/ui";
import {
  submitConsultantInquiry,
  type ConsultantInquiryState,
} from "@/lib/actions/consultant-inquiry";

const initialState: ConsultantInquiryState = { ok: false };

export function ConsultantInquiryForm({
  consultantId,
  consultantName,
}: {
  consultantId: string;
  consultantName: string;
}) {
  const [state, formAction, pending] = useActionState(submitConsultantInquiry, initialState);

  if (state.ok) {
    return (
      <p className="text-sm leading-relaxed text-[var(--muted)] text-pretty">
        Thanks — your message is with our team, and someone will follow up shortly.
      </p>
    );
  }

  return (
    <form action={formAction} className="grid gap-4">
      <Honeypot />
      <input type="hidden" name="consultantId" value={consultantId} />
      <input type="hidden" name="consultantName" value={consultantName} />
      <Field label="Your name">
        <Input name="name" required autoComplete="name" />
      </Field>
      <Field label="Email">
        <Input type="email" name="email" required autoComplete="email" />
      </Field>
      <Field label="Message">
        <Textarea name="message" rows={3} required />
      </Field>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} showIcon={!pending} className="w-full">
        {pending ? "Sending…" : "Send inquiry"}
      </Button>
    </form>
  );
}
