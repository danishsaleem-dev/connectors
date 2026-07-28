import { Quote } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Marquee } from "@/components/Marquee";
import { Eyebrow, Section } from "@/components/ui";
import { testimonials, trustedNames } from "@/lib/content/testimonials";

/**
 * PLACEHOLDER SECTION. `testimonials` and `trustedNames` (src/lib/content/
 * testimonials.ts) are fictional — no real client said any of this, and none
 * of these are real partner names. Replace both arrays with real, permissioned
 * content before this ships publicly. See that file for why.
 */
export function Testimonials() {
  return (
    <Section tone="sunken">
      <Reveal>
        <Eyebrow>What partners say</Eyebrow>
      </Reveal>
      <Reveal i={1}>
        <h2 className="font-display display-lg mt-4 max-w-2xl text-balance">
          Built for brands, landlords and investors like these.
        </h2>
      </Reveal>

      <div className="mt-12 border-y border-[var(--border)] py-6">
        <Marquee duration="38s">
          {trustedNames.map((name) => (
            <span
              key={name}
              className="mx-8 whitespace-nowrap text-sm font-medium uppercase tracking-[0.18em] text-grey-300"
            >
              {name}
            </span>
          ))}
        </Marquee>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {testimonials.map((t, i) => (
          <Reveal key={t.company} i={i}>
            <figure className="flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7">
              <Quote size={22} className="text-violet-400/60" aria-hidden="true" />
              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-[var(--foreground)] text-pretty">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 border-t border-[var(--border)] pt-4 text-sm">
                <span className="block font-medium">{t.role}</span>
                <span className="text-[var(--muted)]">{t.company}</span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
