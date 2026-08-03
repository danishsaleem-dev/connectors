"use client";

import { useActionState, useState } from "react";
import { clsx } from "clsx";
import { register, type RegisterState } from "@/lib/auth/actions";
import { Button, Field, Input, Select } from "@/components/ui";
import { VENDOR_DISCIPLINE_LABEL } from "@/lib/portal/domain";
import type { OrgType } from "@/lib/db/schema";

const initialState: RegisterState = {};

const CHOICES: { value: OrgType; label: string; orgLabel: string }[] = [
  { value: "brand", label: "Brand", orgLabel: "Company name" },
  { value: "franchisee", label: "Franchisee", orgLabel: "Business name (or your own)" },
  { value: "landlord", label: "Landlord", orgLabel: "Company / individual name" },
  { value: "developer", label: "Mall / Developer", orgLabel: "Company name" },
  { value: "investor", label: "Investor", orgLabel: "Company / individual name" },
  { value: "vendor", label: "Vendor", orgLabel: "Studio / company name" },
];

export function RegisterForm({ lockedType }: { lockedType?: OrgType }) {
  const [type, setType] = useState<OrgType>(lockedType ?? "brand");
  const [state, formAction, pending] = useActionState(register, initialState);

  const active = CHOICES.find((c) => c.value === type)!;

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="type" value={type} />

      {!lockedType && (
        <div>
          <span className="mb-1.5 block text-[13px] font-medium">I am a…</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CHOICES.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setType(choice.value)}
                aria-pressed={type === choice.value}
                className={clsx(
                  "rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                  type === choice.value
                    ? "border-violet-600 bg-violet-50 text-violet-600"
                    : "border-[var(--border)] text-[var(--muted)] hover:border-violet-400",
                )}
              >
                {choice.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <Field label={active.orgLabel}>
        <Input name="organizationName" required />
      </Field>

      {/* Asked here rather than left to onboarding — discipline is what makes
          a new partner placeable, so the roster is useful from signup. */}
      {type === "vendor" && (
        <Field label="What do you do?" hint="You can add specialties and cities next">
          <Select name="discipline" required defaultValue="">
            <option value="" disabled>
              Choose your discipline…
            </option>
            {Object.entries(VENDOR_DISCIPLINE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
      )}
      <Field label="Your name">
        <Input name="name" required autoComplete="name" />
      </Field>
      <Field label="Email">
        <Input type="email" name="email" required autoComplete="email" />
      </Field>
      <Field label="Password" hint="At least 8 characters">
        <Input type="password" name="password" required minLength={8} autoComplete="new-password" />
      </Field>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} showIcon={!pending} className="mt-2 w-full">
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
