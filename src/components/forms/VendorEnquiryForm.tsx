"use client";

import { useActionState } from "react";
import { Button, Field, Honeypot, Input, Select, Textarea } from "@/components/ui";
import { FormSuccess } from "./FormSuccess";
import { submitVendorEnquiry, type VendorEnquiryState } from "@/lib/actions/vendor-enquiry";
import { VENDOR_DISCIPLINE_LABEL } from "@/lib/portal/domain";

const initialState: VendorEnquiryState = { ok: false };

/** Single-step on purpose — this is an application to be considered, not the
 * long qualifying intake the brand/landlord wizards run. */
export function VendorEnquiryForm() {
  const [state, formAction, pending] = useActionState(submitVendorEnquiry, initialState);

  if (state.ok) {
    return (
      <FormSuccess
        title="Application received."
        body="We review every application against the work we're actually placing. If there's a fit, we'll be in touch to set up your Partners Program profile."
      />
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8"
    >
      <Honeypot />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Company / Studio name" required>
          <Input name="companyName" required placeholder="e.g. Mono Studio" />
        </Field>
        <Field label="Your name" required>
          <Input name="contactName" required placeholder="Your full name" />
        </Field>
        <Field label="Email" required>
          <Input name="email" type="email" required placeholder="you@studio.com" />
        </Field>
        <Field label="Phone" hint="Optional">
          <Input name="phone" placeholder="+44 …" />
        </Field>
        <Field label="Discipline" required>
          <Select name="discipline" required defaultValue="">
            <option value="" disabled>
              Select your discipline
            </option>
            {Object.entries(VENDOR_DISCIPLINE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Website / portfolio" hint="Optional">
          <Input name="website" type="url" placeholder="https://…" />
        </Field>
        <Field label="Cities you work in" hint="Comma separated">
          <Input name="cities" placeholder="London, Dubai, Lahore" />
        </Field>
        <Field label="Years in business" hint="Optional">
          <Input name="experience" type="number" min={0} placeholder="8" />
        </Field>
        <Field
          label="About your work"
          hint="What you do, who for, and the kind of projects you want"
          required
          className="sm:col-span-2"
        >
          <Textarea
            name="about"
            required
            rows={5}
            placeholder="Tell us about the work you do and the retail or franchise projects you've delivered."
          />
        </Field>
      </div>

      {state.error && (
        <p role="alert" className="mt-5 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <div className="mt-7">
        <Button type="submit" size="lg" disabled={pending} showIcon={!pending}>
          {pending ? "Sending…" : "Submit application"}
        </Button>
      </div>
    </form>
  );
}
