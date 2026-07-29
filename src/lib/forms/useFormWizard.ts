"use client";

import { useRef, useState } from "react";

export type WizardStep = {
  title: string;
  /** Checkbox-group field names on this step that need at least one checked
   * — HTML has no native "at least one of these" constraint, so this is
   * checked manually against the step's own container. */
  groupsRequiringOne?: string[];
};

const GROUP_MESSAGES: Record<string, string> = {
  cities: "Select at least one city.",
  outletTypes: "Select at least one outlet type.",
  locationTypes: "Select at least one preferred location type.",
  propertyTypes: "Select at least one property type.",
  industryInterest: "Select at least one industry.",
  investmentTypes: "Select at least one investment type.",
};

/**
 * Drives a wizard laid over a single native <form>. All fields for every
 * step stay mounted in the DOM the whole time — only visually hidden via the
 * `hidden` class — so the final submit still collects one complete FormData
 * payload. Only per-step validation gates progression.
 */
export function useFormWizard(steps: readonly WizardStep[]) {
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const isLastStep = step === steps.length - 1;

  function setStepRef(index: number) {
    return (el: HTMLDivElement | null) => {
      stepRefs.current[index] = el;
    };
  }

  function validateStep(index: number): boolean {
    const container = stepRefs.current[index];
    if (!container) return true;

    const invalid = container.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      ":invalid",
    );
    if (invalid) {
      invalid.reportValidity();
      invalid.focus();
      return false;
    }

    for (const group of steps[index].groupsRequiringOne ?? []) {
      const checkedCount = container.querySelectorAll(
        `input[name="${group}"]:checked`,
      ).length;
      if (checkedCount === 0) {
        setStepError(GROUP_MESSAGES[group] ?? "Select at least one option.");
        return false;
      }
    }
    return true;
  }

  function goNext() {
    if (!validateStep(step)) return;
    setStepError(null);
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function goBack() {
    setStepError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  // Enter key advances instead of risking an implicit submit — only the
  // wizard's final step renders a type="submit" button.
  function handleKeyDown(e: React.KeyboardEvent<HTMLFormElement>) {
    const target = e.target as HTMLElement;
    if (e.key === "Enter" && target.tagName !== "TEXTAREA" && !isLastStep) {
      e.preventDefault();
      goNext();
    }
  }

  return {
    step,
    stepError,
    isLastStep,
    setStepRef,
    goNext,
    goBack,
    handleKeyDown,
    stepCount: steps.length,
    stepTitle: steps[step].title,
  };
}
