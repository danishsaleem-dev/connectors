import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { AudienceHero } from "@/components/audience/AudienceHero";
import { OrbitField } from "@/components/OrbitField";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { ButtonLink, Eyebrow, Section } from "@/components/ui";
import { partnerBenefits, partnerDisciplines, partnerSteps } from "@/lib/content/partners";
import { photos } from "@/lib/images";

export const metadata: Metadata = {
  title: "Partners Program",
  description:
    "Designers, architects, interior specialists, agencies, consultants and contractors — join the network that delivers our brands’ openings.",
};

export default function PartnersPage() {
  return (
    <>
      <AudienceHero
        eyebrow="Partners Program"
        title="The people who actually build the openings we broker."
        photo={photos.planning}
        jumpLabel="Join the programme"
        jumpHref="/become-a-vendor"
      />

      {/* What it is */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <Reveal>
              <Eyebrow>Why it exists</Eyebrow>
            </Reveal>
            <Reveal i={1}>
              <h2 className="font-display display-lg mt-4 text-balance">
                A signed lease is the start of the work, not the end of it.
              </h2>
            </Reveal>
          </div>
          <div className="lg:pt-14">
            <Reveal i={2}>
              <p className="text-lg leading-relaxed text-[var(--muted)] text-pretty">
                We spend our days matching brands to locations, franchisees to
                systems and investors to models. The moment one of those
                closes, the same questions land every time: who designs it, who
                draws it, who builds it, who launches it.
              </p>
            </Reveal>
            <Reveal i={3}>
              <p className="mt-5 text-lg leading-relaxed text-[var(--muted)] text-pretty">
                The Partners Program is our answer — a vetted bench of
                designers, architects, interior specialists, agencies,
                consultants and contractors we can put in front of a brand the
                day the ink dries.
              </p>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* Disciplines */}
      <Section tone="sunken">
        <Reveal>
          <Eyebrow>Who we’re looking for</Eyebrow>
        </Reveal>
        <Reveal i={1}>
          <h2 className="font-display display-lg mt-4 max-w-2xl text-balance">
            Six disciplines. One bench.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {partnerDisciplines.map((d, i) => (
            <Reveal key={d.key} i={i}>
              <div className="border-t border-[var(--border)] pt-6">
                <h3 className="font-display text-xl">{d.title}</h3>
                <p className="mt-3 leading-relaxed text-[var(--muted)] text-pretty">{d.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Benefits */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <Reveal>
              <Eyebrow>What you get</Eyebrow>
            </Reveal>
            <Reveal i={1}>
              <h2 className="font-display display-lg mt-4 text-balance">
                Work that arrives already qualified.
              </h2>
            </Reveal>
            <Reveal i={2}>
              <div className="mt-8">
                <ButtonLink href="/become-a-vendor" size="lg">
                  Become a vendor
                </ButtonLink>
              </div>
            </Reveal>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            {partnerBenefits.map((b, i) => (
              <Reveal key={b.title} i={i}>
                <div>
                  <h3 className="font-medium">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)] text-pretty">
                    {b.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* How it works */}
      <Section tone="dark" className="overflow-hidden">
        <OrbitField
          count={26}
          strokeWidth={0.3}
          className="animate-orbit pointer-events-none absolute -right-40 top-1/2 h-[36rem] w-[36rem] -translate-y-1/2 text-white/[0.07]"
        />
        <div className="relative">
          <Reveal>
            <Eyebrow className="text-violet-200">How it works</Eyebrow>
          </Reveal>
          <Reveal i={1}>
            <h2 className="font-display display-lg mt-4 max-w-2xl text-balance">
              Four steps, no fee.
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {partnerSteps.map((s, i) => (
              <Reveal key={s.step} i={i}>
                <div className="border-t border-white/15 pt-6">
                  <span className="font-display text-2xl text-violet-200">{s.step}</span>
                  <h3 className="mt-3 font-medium">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60 text-pretty">
                    {s.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Directory teaser */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <Photo
              photo={photos.boardroom}
              sizes="(min-width: 1024px) 50vw, 100vw"
              aspect="landscape"
              className="rounded-3xl"
            />
          </Reveal>
          <div>
            <Reveal i={1}>
              <Eyebrow>Already a member?</Eyebrow>
            </Reveal>
            <Reveal i={2}>
              <h2 className="font-display display-lg mt-4 text-balance">
                Manage your profile from the portal.
              </h2>
            </Reveal>
            <Reveal i={3}>
              <p className="mt-5 leading-relaxed text-[var(--muted)] text-pretty">
                Every published partner has a profile our team works from —
                discipline, city and specialty — kept current from your own
                portal login.
              </p>
            </Reveal>
            <Reveal i={4}>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="?auth=login" variant="secondary">
                  Partner sign in <ArrowUpRight size={14} className="inline" />
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>
    </>
  );
}
