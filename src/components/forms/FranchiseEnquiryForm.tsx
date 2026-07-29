"use client";

import { useActionState, useState } from "react";
import { clsx } from "clsx";
import { Checkbox, Field, FileInput, Honeypot, Input, Radio } from "@/components/ui";
import { FormSuccess } from "./FormSuccess";
import { StepIndicator } from "./StepIndicator";
import { WizardNav } from "./WizardNav";
import { useFormWizard, type WizardStep } from "@/lib/forms/useFormWizard";
import {
  submitFranchiseEnquiry,
  type FranchiseEnquiryState,
} from "@/lib/actions/franchise-enquiry";
import {
  BUSINESS_EXPERIENCE,
  INVESTMENT_CAPACITIES,
  OPERATIONAL_CAPABILITIES,
  TERRITORY_CITIES,
} from "@/lib/schemas/franchise-enquiry";
import { industries } from "@/lib/content/company";

const initialState: FranchiseEnquiryState = { ok: false };

const STEPS: WizardStep[] = [
  { title: "Personal Information" },
  { title: "Investment & Experience" },
  { title: "Franchise Preference", groupsRequiringOne: ["industryInterest", "cities"] },
  { title: "Documents" },
];

export function FranchiseEnquiryForm() {
  const [state, formAction, pending] = useActionState(submitFranchiseEnquiry, initialState);
  const wizard = useFormWizard(STEPS);
  const [otherCity, setOtherCity] = useState(false);

  if (state.ok) {
    return (
      <FormSuccess
        title="Application received."
        body="Our franchise development team reviews every application by hand and will get back to you within one business day."
      />
    );
  }

  return (
    <form
      action={formAction}
      onKeyDown={wizard.handleKeyDown}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8"
    >
      <Honeypot />
      <StepIndicator titles={STEPS.map((s) => s.title)} current={wizard.step} />

      <div ref={wizard.setStepRef(0)} className={clsx(wizard.step !== 0 && "hidden")}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full Name" required>
            <Input name="fullName" required placeholder="Your full name" />
          </Field>
          <Field label="Email Address" required>
            <Input name="email" type="email" required placeholder="you@email.com" />
          </Field>
          <Field label="Mobile Number" required>
            <Input name="mobile" type="tel" required placeholder="+92 3XX XXXXXXX" />
          </Field>
          <Field label="City of Residence" required>
            <Input name="cityOfResidence" required placeholder="e.g. Lahore" />
          </Field>
        </div>
      </div>

      <div
        ref={wizard.setStepRef(1)}
        className={clsx(wizard.step !== 1 && "hidden", "space-y-6")}
      >
        <Field label="Investment Capacity" required>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {INVESTMENT_CAPACITIES.map((option) => (
              <Radio
                key={option}
                name="investmentCapacity"
                value={option}
                label={option}
                required
              />
            ))}
          </div>
        </Field>

        <Field label="Business Experience" required>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {BUSINESS_EXPERIENCE.map((option) => (
              <Radio
                key={option}
                name="businessExperience"
                value={option}
                label={option}
                required
              />
            ))}
          </div>
        </Field>

        <Field label="Current Business" hint="Optional">
          <Input name="currentBusiness" placeholder="What do you currently run, if anything?" />
        </Field>
      </div>

      <div
        ref={wizard.setStepRef(2)}
        className={clsx(wizard.step !== 2 && "hidden", "space-y-6")}
      >
        <Field label="Industry Interest" required>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {industries.map((industry) => (
              <Checkbox
                key={industry}
                name="industryInterest"
                value={industry}
                label={industry}
              />
            ))}
          </div>
        </Field>

        <Field label="Preferred Territory" required>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {TERRITORY_CITIES.map((city) => (
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

        <Field label="How Will You Operate It?" required>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {OPERATIONAL_CAPABILITIES.map((option) => (
              <Radio
                key={option}
                name="operationalCapability"
                value={option}
                label={option}
                required
              />
            ))}
          </div>
        </Field>
      </div>

      <div
        ref={wizard.setStepRef(3)}
        className={clsx(wizard.step !== 3 && "hidden", "space-y-6")}
      >
        <Field label="CV / Business Profile" hint="Optional, PDF">
          <FileInput name="supportingDocument" accept="application/pdf" />
        </Field>
      </div>

      {(wizard.stepError || state.error) && (
        <p role="alert" className="mt-6 text-sm text-red-600">
          {wizard.stepError ?? state.error}
        </p>
      )}

      <WizardNav
        showBack={wizard.step > 0}
        isLastStep={wizard.isLastStep}
        pending={pending}
        onBack={wizard.goBack}
        onNext={wizard.goNext}
        submitLabel="Submit application"
      />
    </form>
  );
}
