"use client";

import { useActionState, useState } from "react";
import { clsx } from "clsx";
import { Checkbox, Field, FileInput, Honeypot, Input, Radio } from "@/components/ui";
import { FormSuccess } from "./FormSuccess";
import { StepIndicator } from "./StepIndicator";
import { WizardNav } from "./WizardNav";
import { useFormWizard, type WizardStep } from "@/lib/forms/useFormWizard";
import {
  submitInvestorEnquiry,
  type InvestorEnquiryState,
} from "@/lib/actions/investor-enquiry";
import {
  INVESTMENT_HORIZONS,
  INVESTMENT_TYPES,
  INVESTOR_CITIES,
  TICKET_SIZES,
} from "@/lib/schemas/investor-enquiry";
import { industries } from "@/lib/content/company";

const initialState: InvestorEnquiryState = { ok: false };

const STEPS: WizardStep[] = [
  { title: "Contact Information" },
  { title: "Investment Profile", groupsRequiringOne: ["investmentTypes", "sectorInterest"] },
  { title: "Preferences", groupsRequiringOne: ["cities"] },
  { title: "Documents" },
];

export function InvestorEnquiryForm() {
  const [state, formAction, pending] = useActionState(submitInvestorEnquiry, initialState);
  const wizard = useFormWizard(STEPS);
  const [otherCity, setOtherCity] = useState(false);

  if (state.ok) {
    return (
      <FormSuccess
        title="Interest submitted."
        body="Our investor connections team will review your profile and reach out with matching opportunities."
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
          <Field label="Company / Fund Name" hint="Optional">
            <Input name="companyOrFund" placeholder="If applicable" />
          </Field>
        </div>
      </div>

      <div
        ref={wizard.setStepRef(1)}
        className={clsx(wizard.step !== 1 && "hidden", "space-y-6")}
      >
        <Field label="Investment Ticket Size" required>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {TICKET_SIZES.map((size) => (
              <Radio key={size} name="ticketSize" value={size} label={size} required />
            ))}
          </div>
        </Field>

        <Field label="Preferred Investment Type" required>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {INVESTMENT_TYPES.map((type) => (
              <Checkbox key={type} name="investmentTypes" value={type} label={type} />
            ))}
          </div>
        </Field>

        <Field label="Sector Interest" required>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {industries.map((industry) => (
              <Checkbox
                key={industry}
                name="sectorInterest"
                value={industry}
                label={industry}
              />
            ))}
          </div>
        </Field>
      </div>

      <div
        ref={wizard.setStepRef(2)}
        className={clsx(wizard.step !== 2 && "hidden", "space-y-6")}
      >
        <Field label="Preferred City / Region" required>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {INVESTOR_CITIES.map((city) => (
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
            <Input
              name="otherCity"
              placeholder="Which city or region?"
              className="mt-3"
              required
            />
          )}
        </Field>

        <Field label="Investment Horizon" required>
          <div className="grid grid-cols-1 gap-3">
            {INVESTMENT_HORIZONS.map((horizon) => (
              <Radio key={horizon} name="horizon" value={horizon} label={horizon} required />
            ))}
          </div>
        </Field>
      </div>

      <div
        ref={wizard.setStepRef(3)}
        className={clsx(wizard.step !== 3 && "hidden", "space-y-6")}
      >
        <Field label="Investment Profile / Company Overview" hint="Optional, PDF">
          <FileInput name="investmentProfile" accept="application/pdf" />
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
        submitLabel="Submit interest"
      />
    </form>
  );
}
