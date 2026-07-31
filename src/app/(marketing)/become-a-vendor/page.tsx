import type { Metadata } from "next";
import { AudienceHero } from "@/components/audience/AudienceHero";
import { VendorEnquiryForm } from "@/components/forms/VendorEnquiryForm";
import { Reveal } from "@/components/Reveal";
import { ButtonLink, Eyebrow, Section } from "@/components/ui";
import { partnerSteps } from "@/lib/content/partners";
import { photos } from "@/lib/images";

export const metadata: Metadata = {
  title: "Become a Vendor",
  description:
    "Apply to the Connectors Partners Program — for designers, architects, interior specialists, agencies, consultants and contractors.",
};

export default function BecomeAVendorPage() {
  return (
    <>
      <AudienceHero
        eyebrow="Become a vendor"
        title="Put your studio in front of brands that are already opening."
        photo={photos.signing}
        jumpLabel="Start your application"
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <Reveal>
              <Eyebrow>Before you apply</Eyebrow>
            </Reveal>
            <Reveal i={1}>
              <h2 className="font-display display-lg mt-4 text-balance">
                What happens next.
              </h2>
            </Reveal>
            <Reveal i={2}>
              <p className="mt-5 leading-relaxed text-[var(--muted)] text-pretty">
                We review every application against the work our brands are
                actually asking for. If there’s a fit we’ll set up a call —
                if there isn’t one yet, we’ll keep you on file rather than
                pretend otherwise.
              </p>
            </Reveal>
            <Reveal i={3}>
              <div className="mt-8">
                <ButtonLink href="/partners" variant="ghost">
                  Read about the programme
                </ButtonLink>
              </div>
            </Reveal>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            {partnerSteps.map((s, i) => (
              <Reveal key={s.step} i={i}>
                <div className="border-t border-[var(--border)] pt-5">
                  <span className="font-display text-xl text-violet-600">{s.step}</span>
                  <h3 className="mt-2 font-medium">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)] text-pretty">
                    {s.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section id="request-form" tone="sunken">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <Eyebrow>Partners Program application</Eyebrow>
          </Reveal>
          <Reveal i={1}>
            <h2 className="font-display display-lg mt-4 text-balance">
              Tell us what you do, and who you do it for.
            </h2>
          </Reveal>
          <Reveal i={2}>
            <p className="mt-5 leading-relaxed text-[var(--muted)] text-pretty">
              There’s no fee to join and no charge to be listed. Every field
              marked <span className="text-violet-400">*</span> is required —
              the rest helps us match you faster.
            </p>
          </Reveal>

          <Reveal i={3} className="mt-10">
            <VendorEnquiryForm />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
