import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ShieldCheck, Sparkles } from "lucide-react";
import { AudienceHero } from "@/components/audience/AudienceHero";
import { RegisterForm } from "@/components/portal/RegisterForm";
import { Reveal } from "@/components/Reveal";
import { Eyebrow, Section } from "@/components/ui";
import { photos } from "@/lib/images";

export const metadata: Metadata = {
  title: "Become a Consultant",
  description:
    "Join Connectors' in-house consultancy roster — set up your account, then add your experience and degrees to your profile.",
};

const STEPS = [
  {
    step: "01",
    title: "Create your account",
    body: "One minute — your name, email and a password. Your portal access is instant.",
  },
  {
    step: "02",
    title: "Build your profile",
    body: "Add your bio, areas of expertise, and your experience and degrees, from your consultant profile page.",
  },
  {
    step: "03",
    title: "We review, then publish",
    body: "Our team checks every profile before it appears on the public consultants page.",
  },
];

export default function BecomeAConsultantPage() {
  return (
    <>
      <AudienceHero
        eyebrow="Become a consultant"
        title="Put your expertise in front of brands making expansion decisions."
        photo={photos.boardroom}
        jumpLabel="Create your account"
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <Reveal>
              <Eyebrow>Before you sign up</Eyebrow>
            </Reveal>
            <Reveal i={1}>
              <h2 className="font-display display-lg mt-4 text-balance">What happens next.</h2>
            </Reveal>
            <Reveal i={2}>
              <p className="mt-5 leading-relaxed text-[var(--muted)] text-pretty">
                This is Connectors&rsquo; own consultancy roster, not the Partners
                Program — your profile is what brands, franchisees and
                landlords see when they come to us for advice.
              </p>
            </Reveal>
            <Reveal i={3}>
              <div className="mt-8 flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <ShieldCheck size={18} />
                </span>
                <p className="text-sm leading-relaxed text-[var(--muted)] text-pretty">
                  Nothing is published automatically — our team reviews every
                  profile before it goes live.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((s, i) => (
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
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-20">
          <div>
            <Reveal>
              <Eyebrow>Create your account</Eyebrow>
            </Reveal>
            <Reveal i={1}>
              <h2 className="font-display display-lg mt-4 text-balance">
                Join the consultants roster.
              </h2>
            </Reveal>
            <Reveal i={2}>
              <p className="mt-5 max-w-md leading-relaxed text-[var(--muted)] text-pretty">
                Sign up now with the basics. Once you&rsquo;re in, add your
                experience and degrees from your profile page.
              </p>
            </Reveal>

            <div className="mt-10 flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <GraduationCap size={18} />
              </span>
              <p className="text-sm leading-relaxed text-[var(--muted)] text-pretty">
                Experience and degrees live on your profile, not the signup
                form — add supporting documents whenever you&rsquo;re ready.
              </p>
            </div>
            <div className="mt-4 flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Sparkles size={18} />
              </span>
              <p className="text-sm leading-relaxed text-[var(--muted)] text-pretty">
                Free to join. Your profile stays unpublished until our team
                reviews it.
              </p>
            </div>
          </div>

          <Reveal i={1}>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
              <RegisterForm lockedType="consultant" />
              <p className="mt-6 text-center text-sm text-[var(--muted)]">
                Already have an account?{" "}
                <Link
                  href="?auth=login"
                  scroll={false}
                  className="text-violet-600 underline underline-offset-4"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
