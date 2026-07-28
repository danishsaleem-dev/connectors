"use client";

import { useActionState, useRef, useState } from "react";
import { clsx } from "clsx";
import { Check } from "lucide-react";
import {
  Button,
  Checkbox,
  Field,
  FileInput,
  Honeypot,
  Input,
  Radio,
  Textarea,
} from "@/components/ui";
import { submitBrandEnquiry, type BrandEnquiryState } from "@/lib/actions/brand-enquiry";
import {
  ADDITIONAL_SERVICES,
  LOCATION_TYPES,
  OUTLET_TYPES,
  RENTAL_BUDGETS,
  REQUIRED_CITIES,
} from "@/lib/schemas/brand-enquiry";

const initialState: BrandEnquiryState = { ok: false };

const STEPS = [
  { title: "Company Information", groupsRequiringOne: [] as string[] },
  { title: "Expansion Requirement", groupsRequiringOne: ["cities"] },
  { title: "Space Requirement", groupsRequiringOne: ["outletTypes", "locationTypes"] },
  { title: "Financial & Additional Services", groupsRequiringOne: [] },
  { title: "Uploads", groupsRequiringOne: [] },
] as const;

const GROUP_LABEL: Record<string, string> = {
  cities: "Select at least one city.",
  outletTypes: "Select at least one outlet type.",
  locationTypes: "Select at least one preferred location type.",
};

export function BrandEnquiryForm() {
  const [state, formAction, pending] = useActionState(submitBrandEnquiry, initialState);
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const [otherCity, setOtherCity] = useState(false);
  const [otherOutlet, setOtherOutlet] = useState(false);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const isLastStep = step === STEPS.length - 1;

  function validateStep(index: number): boolean {
    const container = stepRefs.current[index];
    if (!container) return true;

    // Standard fields: rely on the browser's own required/type constraints.
    const invalid = container.querySelector<
      HTMLInputElement | HTMLTextAreaElement
    >(":invalid");
    if (invalid) {
      invalid.reportValidity();
      invalid.focus();
      return false;
    }

    // Checkbox groups: HTML has no native "at least one of these" constraint,
    // so each listed group is checked manually.
    for (const group of STEPS[index].groupsRequiringOne) {
      const checkedCount = container.querySelectorAll(
        `input[name="${group}"]:checked`,
      ).length;
      if (checkedCount === 0) {
        setStepError(GROUP_LABEL[group]);
        return false;
      }
    }

    return true;
  }

  function goNext() {
    if (!validateStep(step)) return;
    setStepError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStepError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  // Enter key advances to the next step instead of risking an implicit
  // submit — only the last step's button is type="submit".
  function handleKeyDown(e: React.KeyboardEvent<HTMLFormElement>) {
    const target = e.target as HTMLElement;
    if (e.key === "Enter" && target.tagName !== "TEXTAREA" && !isLastStep) {
      e.preventDefault();
      goNext();
    }
  }

  if (state.ok) {
    return (
      <div className="flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600">
          <Check size={18} />
        </span>
        <div>
          <p className="font-display text-xl">Request received.</p>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
            A member of our brand expansion team will review this and get back
            to you within one business day.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      onKeyDown={handleKeyDown}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8"
    >
      <Honeypot />

      {/* Step indicator */}
      <div className="mb-2 flex items-center">
        {STEPS.map((s, i) => (
          <div key={s.title} className="flex flex-1 items-center last:flex-none">
            <span
              className={clsx(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
                i === step && "bg-violet-600 text-white",
                i < step && "bg-violet-50 text-violet-600",
                i > step && "bg-grey-100 text-grey-300",
              )}
            >
              {i < step ? <Check size={13} /> : i + 1}
            </span>
            {i < STEPS.length - 1 && (
              <span
                className={clsx(
                  "mx-1.5 h-px flex-1 transition-colors",
                  i < step ? "bg-violet-300" : "bg-[var(--border)]",
                )}
              />
            )}
          </div>
        ))}
      </div>
      <p className="eyebrow mb-8">
        Step {step + 1} of {STEPS.length} — {STEPS[step].title}
      </p>

      <div ref={(el) => { stepRefs.current[0] = el; }} className={clsx(step !== 0 && "hidden")}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Brand Name" required>
            <Input name="brandName" required placeholder="e.g. Verona Kitchens" />
          </Field>
          <Field label="Company Name" required>
            <Input name="companyName" required placeholder="Registered company name" />
          </Field>
          <Field label="Contact Person Name" required>
            <Input name="contactName" required placeholder="Full name" />
          </Field>
          <Field label="Designation">
            <Input name="designation" placeholder="e.g. Expansion Manager" />
          </Field>
          <Field label="Mobile Number" required>
            <Input name="mobile" type="tel" required placeholder="+92 3XX XXXXXXX" />
          </Field>
          <Field label="Email Address" required>
            <Input name="email" type="email" required placeholder="you@company.com" />
          </Field>
          <Field label="Website / Social Media" className="sm:col-span-2">
            <Input name="website" placeholder="https://" />
          </Field>
        </div>
      </div>

      <div ref={(el) => { stepRefs.current[1] = el; }} className={clsx(step !== 1 && "hidden", "space-y-6")}>
        <Field label="Required City" required>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {REQUIRED_CITIES.map((city) => (
              <Checkbox
                key={city}
                name="cities"
                value={city}
                label={city}
                onChange={
                  city === "Other" ? (e) => setOtherCity(e.target.checked) : undefined
                }
              />
            ))}
          </div>
          {otherCity && (
            <Input name="otherCity" placeholder="Which city?" className="mt-3" required />
          )}
        </Field>

        <Field
          label="Preferred Area(s)"
          required
          hint="e.g. DHA Phase 6, Gulberg Main Boulevard, Johar Town"
        >
          <Textarea
            name="preferredAreas"
            required
            placeholder="List the specific areas or neighbourhoods you're targeting"
          />
        </Field>
      </div>

      <div ref={(el) => { stepRefs.current[2] = el; }} className={clsx(step !== 2 && "hidden", "space-y-6")}>
        <Field label="Outlet Type" required>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {OUTLET_TYPES.map((type) => (
              <Checkbox
                key={type}
                name="outletTypes"
                value={type}
                label={type}
                onChange={
                  type === "Other" ? (e) => setOtherOutlet(e.target.checked) : undefined
                }
              />
            ))}
          </div>
          {otherOutlet && (
            <Input
              name="otherOutletType"
              placeholder="What kind of outlet?"
              className="mt-3"
              required
            />
          )}
        </Field>

        <Field label="Required Area (Sq Ft)" required>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Minimum" className="text-xs">
              <Input name="areaMin" type="number" min={0} required placeholder="e.g. 800" />
            </Field>
            <Field label="Maximum" className="text-xs">
              <Input name="areaMax" type="number" min={0} required placeholder="e.g. 1500" />
            </Field>
          </div>
        </Field>

        <Field label="Preferred Location Type" required>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {LOCATION_TYPES.map((type) => (
              <Checkbox key={type} name="locationTypes" value={type} label={type} />
            ))}
          </div>
        </Field>
      </div>

      <div ref={(el) => { stepRefs.current[3] = el; }} className={clsx(step !== 3 && "hidden", "space-y-6")}>
        <Field label="Monthly Rental Budget" required>
          <div className="grid grid-cols-2 gap-3">
            {RENTAL_BUDGETS.map((budget) => (
              <Radio key={budget} name="rentalBudget" value={budget} label={budget} required />
            ))}
          </div>
        </Field>

        <Field label="Additional Services Required" hint="Optional">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ADDITIONAL_SERVICES.map((service) => (
              <Checkbox
                key={service}
                name="additionalServices"
                value={service}
                label={service}
              />
            ))}
          </div>
        </Field>
      </div>

      <div ref={(el) => { stepRefs.current[4] = el; }} className={clsx(step !== 4 && "hidden", "space-y-6")}>
        <Field label="Company Profile (PDF)" hint="Optional">
          <FileInput name="companyProfile" accept="application/pdf" />
        </Field>
        <Field label="Brand Logo" hint="Optional">
          <FileInput name="brandLogo" accept="image/*" />
        </Field>
        <Field label="Existing Outlet Photos" hint="Optional, up to a few">
          <FileInput name="outletPhotos" accept="image/*" multiple />
        </Field>
      </div>

      {(stepError || state.error) && (
        <p role="alert" className="mt-6 text-sm text-red-600">
          {stepError ?? state.error}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between border-t border-[var(--border)] pt-8">
        {step > 0 ? (
          <Button type="button" variant="secondary" showIcon={false} onClick={goBack}>
            Back
          </Button>
        ) : (
          <span />
        )}

        {isLastStep ? (
          <Button type="submit" disabled={pending} showIcon={!pending}>
            {pending ? "Submitting…" : "Submit request"}
          </Button>
        ) : (
          <Button type="button" showIcon={false} onClick={goNext}>
            Continue
          </Button>
        )}
      </div>
    </form>
  );
}
