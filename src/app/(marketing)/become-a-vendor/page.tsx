import type { Metadata } from "next";
import Link from "next/link";
import { AudienceHero } from "@/components/audience/AudienceHero";
import { RegisterForm } from "@/components/portal/RegisterForm";
import { Reveal } from "@/components/Reveal";
import { ButtonLink, Eyebrow, Section } from "@/components/ui";
import { partnerSteps } from "@/lib/content/partners";
import { photos } from "@/lib/images";

export const metadata: Metadata = {
  title: "Become a Vendor",
  description:
    "Create your Partners Program account — for designers, architects, interior specialists, agencies, consultants and contractors.",
};

export default function BecomeAVendorPage() {
  return (
    <>
      <AudienceHero
        eyebrow="Become a vendor"
        title="Put your studio in front of brands that are already opening."
        photo={photos.signing}
        jumpLabel="Create your account"
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <Reveal>
              <Eyebrow>Before you sign up</Eyebrow>
            </Reveal>
            <Reveal i={1}>
              <h2 className="font-display display-lg mt-4 text-balance">
                What happens next.
              </h2>
            </Reveal>
            <Reveal i={2}>
              <p className="mt-5 leading-relaxed text-[var(--muted)] text-pretty">
                Your account and portal access are instant. Build your
                profile there, and our team reviews it before it goes live
                in the public directory — so every listed partner is one
                brands can actually trust.
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
        <div className="mx-auto max-w-md">
          <Reveal>
            <Eyebrow>Create your account</Eyebrow>
          </Reveal>
          <Reveal i={1}>
            <h2 className="font-display display-lg mt-4 text-balance">
              Join the Partners Program.
            </h2>
          </Reveal>
          <Reveal i={2}>
            <p className="mt-5 leading-relaxed text-[var(--muted)] text-pretty">
              No fee to join, no charge to be listed. Set your password now
              and move straight into building your profile.
            </p>
          </Reveal>

          <Reveal i={3} className="mt-10">
            <RegisterForm lockedType="vendor" />
          </Reveal>

          <Reveal i={4}>
            <p className="mt-6 text-center text-sm text-[var(--muted)]">
              Already have an account?{" "}
              <Link
                href="/portal/login"
                className="text-violet-600 underline underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
