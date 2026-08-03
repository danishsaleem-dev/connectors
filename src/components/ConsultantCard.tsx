"use client";

import { useActionState, useState } from "react";
import { Modal } from "@/components/Modal";
import { Button, Field, Honeypot, Input, Textarea } from "@/components/ui";
import {
  submitConsultantInquiry,
  type ConsultantInquiryState,
} from "@/lib/actions/consultant-inquiry";

type ConsultantData = {
  id: string;
  name: string;
  photoUrl: string | null;
  expertise: string[];
  yearsExperience: number | null;
  bio: string | null;
};

/** The card opens a modal with the full profile and an inquiry form —
 * clicking through to a dedicated page per person isn't worth a whole route
 * for a roster this size. */
export function ConsultantCard({ name, photoUrl, expertise, yearsExperience, bio, id }: ConsultantData) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-left transition-all hover:border-violet-400 hover:shadow-[0_28px_56px_-32px_rgba(20,20,26,0.35)]"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-sunken)]">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- private signed Storage URL
            <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-display text-3xl text-[var(--muted)]/40">
                {name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-lg">{name}</h3>
          {expertise.length > 0 && (
            <p className="mt-1 text-sm text-violet-600">{expertise.join(" · ")}</p>
          )}
          {yearsExperience != null && (
            <p className="mt-1 text-xs text-[var(--muted)]">
              {yearsExperience} years of experience
            </p>
          )}
        </div>
      </button>

      {open && (
        <Modal onClose={() => setOpen(false)} className="max-h-[85vh] max-w-lg overflow-y-auto">
          <ConsultantModalBody
            id={id}
            name={name}
            photoUrl={photoUrl}
            expertise={expertise}
            yearsExperience={yearsExperience}
            bio={bio}
          />
        </Modal>
      )}
    </>
  );
}

function ConsultantModalBody({ id, name, photoUrl, expertise, yearsExperience, bio }: ConsultantData) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-start gap-4">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- private signed Storage URL
          <img
            src={photoUrl}
            alt={name}
            className="h-20 w-20 shrink-0 rounded-2xl border border-[var(--border)] object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-sunken)]">
            <span className="font-display text-2xl text-[var(--muted)]">{name.charAt(0)}</span>
          </div>
        )}
        <div className="min-w-0 pt-1">
          <h2 className="font-display text-xl">{name}</h2>
          {expertise.length > 0 && (
            <p className="mt-1 text-sm text-violet-600">{expertise.join(" · ")}</p>
          )}
          {yearsExperience != null && (
            <p className="mt-1 text-xs text-[var(--muted)]">
              {yearsExperience} years of experience
            </p>
          )}
        </div>
      </div>

      {bio && (
        <p className="mt-6 text-sm leading-relaxed text-[var(--muted)] text-pretty">{bio}</p>
      )}

      <div className="mt-6 border-t border-[var(--border)] pt-6">
        {!showForm ? (
          <Button type="button" onClick={() => setShowForm(true)} className="w-full">
            Inquire about {name.split(" ")[0]}
          </Button>
        ) : (
          <ConsultantInquiryForm consultantId={id} consultantName={name} />
        )}
      </div>
    </div>
  );
}

const initialState: ConsultantInquiryState = { ok: false };

function ConsultantInquiryForm({
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

      <Button type="submit" disabled={pending} showIcon={!pending} className="mt-1 w-full">
        {pending ? "Sending…" : "Send inquiry"}
      </Button>
    </form>
  );
}
