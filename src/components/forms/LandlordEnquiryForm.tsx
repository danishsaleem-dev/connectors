"use client";

import { useActionState, useState } from "react";
import { clsx } from "clsx";
import { Checkbox, Field, FileInput, Honeypot, Input, Radio } from "@/components/ui";
import { FormSuccess } from "./FormSuccess";
import { StepIndicator } from "./StepIndicator";
import { WizardNav } from "./WizardNav";
import { useFormWizard, type WizardStep } from "@/lib/forms/useFormWizard";
import {
  submitLandlordEnquiry,
  type LandlordEnquiryState,
} from "@/lib/actions/landlord-enquiry";
import {
  EXPECTED_RENT_RANGES,
  OCCUPANCY_STATUSES,
  PROPERTY_CITIES,
  PROPERTY_TYPES,
} from "@/lib/schemas/landlord-enquiry";

const initialState: LandlordEnquiryState = { ok: false };

const STEPS: WizardStep[] = [
  { title: "Contact Information" },
  { title: "Property Details", groupsRequiringOne: ["propertyTypes", "cities"] },
  { title: "Leasing Details" },
  { title: "Uploads" },
];

export function LandlordEnquiryForm() {
  const [state, formAction, pending] = useActionState(submitLandlordEnquiry, initialState);
  const wizard = useFormWizard(STEPS);
  const [otherCity, setOtherCity] = useState(false);

  if (state.ok) {
    return (
      <FormSuccess
        title="Property submitted."
        body="We'll review the details and reach out once we've matched it against brands actively looking to expand in your area."
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
          <Field label="Company / Entity Name" hint="Optional">
            <Input name="companyName" placeholder="If applicable" />
          </Field>
          <Field label="Mobile Number" required>
            <Input name="mobile" type="tel" required placeholder="+92 3XX XXXXXXX" />
          </Field>
          <Field label="Email Address" required>
            <Input name="email" type="email" required placeholder="you@email.com" />
          </Field>
        </div>
      </div>

      <div
        ref={wizard.setStepRef(1)}
        className={clsx(wizard.step !== 1 && "hidden", "space-y-6")}
      >
        <Field label="Property Type" required>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {PROPERTY_TYPES.map((type) => (
              <Checkbox key={type} name="propertyTypes" value={type} label={type} />
            ))}
          </div>
        </Field>

        <Field label="Property Address / Location" required>
          <Input name="address" required placeholder="Street, area, landmark" />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="City" required>
            <div className="grid grid-cols-2 gap-3">
              {PROPERTY_CITIES.map((city) => (
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

          <Field label="Total Area (Sq Ft)" required>
            <Input
              name="totalAreaSqFt"
              type="number"
              min={0}
              required
              placeholder="e.g. 2200"
            />
          </Field>
        </div>
      </div>

      <div
        ref={wizard.setStepRef(2)}
        className={clsx(wizard.step !== 2 && "hidden", "space-y-6")}
      >
        <Field label="Available From" required>
          <Input name="availableFrom" type="date" required />
        </Field>

        <Field label="Expected Monthly Rent" required>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {EXPECTED_RENT_RANGES.map((range) => (
              <Radio key={range} name="expectedRent" value={range} label={range} required />
            ))}
          </div>
        </Field>

        <Field label="Current Occupancy Status" required>
          <div className="grid grid-cols-1 gap-3">
            {OCCUPANCY_STATUSES.map((status) => (
              <Radio
                key={status}
                name="occupancyStatus"
                value={status}
                label={status}
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
        <Field label="Property Photos" hint="Optional, up to a few">
          <FileInput name="propertyPhotos" accept="image/*" multiple />
        </Field>
        <Field label="Floor Plan / Layout" hint="Optional">
          <FileInput name="floorPlan" accept="image/*,application/pdf" />
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
        submitLabel="Submit property"
      />
    </form>
  );
}
