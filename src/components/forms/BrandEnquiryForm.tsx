"use client";

import { useActionState, useState } from "react";
import { clsx } from "clsx";
import {
  Checkbox,
  Field,
  FileInput,
  Honeypot,
  Input,
  Radio,
  Textarea,
} from "@/components/ui";
import { FormSuccess } from "./FormSuccess";
import { StepIndicator } from "./StepIndicator";
import { WizardNav } from "./WizardNav";
import { useFormWizard, type WizardStep } from "@/lib/forms/useFormWizard";
import { submitBrandEnquiry, type BrandEnquiryState } from "@/lib/actions/brand-enquiry";
import {
  ADDITIONAL_SERVICES,
  LOCATION_TYPES,
  OUTLET_TYPES,
  RENTAL_BUDGETS,
  REQUIRED_CITIES,
} from "@/lib/schemas/brand-enquiry";

const initialState: BrandEnquiryState = { ok: false };

const STEPS: WizardStep[] = [
  { title: "Company Information" },
  { title: "Expansion Requirement", groupsRequiringOne: ["cities"] },
  { title: "Space Requirement", groupsRequiringOne: ["outletTypes", "locationTypes"] },
  { title: "Financial & Additional Services" },
  { title: "Uploads" },
];

export function BrandEnquiryForm() {
  const [state, formAction, pending] = useActionState(submitBrandEnquiry, initialState);
  const wizard = useFormWizard(STEPS);
  const [otherCity, setOtherCity] = useState(false);
  const [otherOutlet, setOtherOutlet] = useState(false);

  if (state.ok) {
    return (
      <FormSuccess
        title="Request received."
        body="A member of our brand expansion team will review this and get back to you within one business day."
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
      <StepIndicator
        titles={STEPS.map((s) => s.title)}
        current={wizard.step}
      />

      <div ref={wizard.setStepRef(0)} className={clsx(wizard.step !== 0 && "hidden")}>
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

      <div
        ref={wizard.setStepRef(1)}
        className={clsx(wizard.step !== 1 && "hidden", "space-y-6")}
      >
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

      <div
        ref={wizard.setStepRef(2)}
        className={clsx(wizard.step !== 2 && "hidden", "space-y-6")}
      >
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

      <div
        ref={wizard.setStepRef(3)}
        className={clsx(wizard.step !== 3 && "hidden", "space-y-6")}
      >
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

      <div
        ref={wizard.setStepRef(4)}
        className={clsx(wizard.step !== 4 && "hidden", "space-y-6")}
      >
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
      />
    </form>
  );
}
