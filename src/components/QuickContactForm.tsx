"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { Button, Honeypot } from "@/components/ui";
import { submitQuickContact, type QuickContactState } from "@/lib/actions/contact";

const initialState: QuickContactState = { ok: false };

/** Dark-background field styling — kept local since Input/Textarea in ui.tsx
 * are tuned for light surfaces and fighting that with override classes would
 * depend on Tailwind's build-order specificity rather than anything reliable. */
const fieldCls =
  "w-full rounded-xl border border-white/20 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/50 focus:ring-2 focus:ring-white/10";

export function QuickContactForm() {
  const [state, formAction, pending] = useActionState(submitQuickContact, initialState);

  if (state.ok) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-6">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
          <Check size={16} />
        </span>
        <div>
          <p className="font-display text-lg text-white">Message sent.</p>
          <p className="mt-1 text-sm text-white/60">
            We read every message ourselves and reply within one business day.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <Honeypot />

      <label className="block text-sm">
        <span className="mb-1.5 block text-white/70">Name</span>
        <input name="name" required placeholder="Your name" className={fieldCls} />
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block text-white/70">Email</span>
        <input
          type="email"
          name="email"
          required
          placeholder="you@company.com"
          className={fieldCls}
        />
      </label>

      <label className="block text-sm sm:col-span-2">
        <span className="mb-1.5 block text-white/70">Message</span>
        <textarea
          name="message"
          required
          minLength={10}
          rows={3}
          placeholder="What are you trying to grow?"
          className={`${fieldCls} resize-y`}
        />
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-red-300 sm:col-span-2">
          {state.error}
        </p>
      )}

      <div className="sm:col-span-2">
        <Button type="submit" variant="onDark" size="lg" disabled={pending} showIcon={!pending}>
          {pending ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
