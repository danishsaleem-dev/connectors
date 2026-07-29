import { Button } from "@/components/ui";

export function WizardNav({
  showBack,
  isLastStep,
  pending,
  onBack,
  onNext,
  submitLabel = "Submit request",
}: {
  showBack: boolean;
  isLastStep: boolean;
  pending: boolean;
  onBack: () => void;
  onNext: () => void;
  submitLabel?: string;
}) {
  return (
    <div className="mt-8 flex items-center justify-between border-t border-[var(--border)] pt-8">
      {showBack ? (
        <Button type="button" variant="secondary" showIcon={false} onClick={onBack}>
          Back
        </Button>
      ) : (
        <span />
      )}

      {isLastStep ? (
        <Button type="submit" disabled={pending} showIcon={!pending}>
          {pending ? "Submitting…" : submitLabel}
        </Button>
      ) : (
        <Button type="button" showIcon={false} onClick={onNext}>
          Continue
        </Button>
      )}
    </div>
  );
}
