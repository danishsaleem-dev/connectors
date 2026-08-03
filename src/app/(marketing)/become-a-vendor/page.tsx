import type { Metadata } from "next";
import Link from "next/link";
import { Handshake, ShieldCheck, Wallet } from "lucide-react";
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

const JOIN_ASSURANCES = [
  {
    icon: ShieldCheck,
    title: "Private by default",
    body: "Your profile is never published or browsable. Only the Connectors team sees it, and only to place you on real projects.",
  },
  {
    icon: Wallet,
    title: "No fee, no subscription",
    body: "Free to join and free to stay on the bench. We're paid on the expansion deal, not by our partners.",
  },
  {
    icon: Handshake,
    title: "Briefed work, not cold leads",
    body: "When we introduce you, the site, the scope and the timeline are already agreed with the brand.",
  },
];

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
                Your account and portal access are instant. Build your profile
                there, and our team vets it before you join the bench we place
                projects from. Nothing about you is ever published — the work
                comes to you through us.
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
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-20">
          <div>
            <Reveal>
              <Eyebrow>Create your account</Eyebrow>
            </Reveal>
            <Reveal i={1}>
              <h2 className="font-display display-lg mt-4 text-balance">
                Join the Partners Program.
              </h2>
            </Reveal>
            <Reveal i={2}>
              <p className="mt-5 max-w-md leading-relaxed text-[var(--muted)] text-pretty">
                One minute to join. Tell us your discipline now and our team
                can start placing you against live projects straight away.
              </p>
            </Reveal>

            {/* The three things a vendor actually wants to know before
                handing over their details, answered next to the form
                rather than buried further up the page. */}
            <div className="mt-10 space-y-6">
              {JOIN_ASSURANCES.map((item, i) => (
                <Reveal key={item.title} i={i + 3}>
                  <div className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <item.icon size={18} />
                    </span>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-[var(--muted)] text-pretty">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal i={1}>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
              <RegisterForm lockedType="vendor" />
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
