import type { Metadata } from "next";
import { ConsultantCard } from "@/components/ConsultantCard";
import { CtaSection } from "@/components/CtaSection";
import { FaqVideoSection } from "@/components/FaqVideoSection";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { TestimonialSection } from "@/components/TestimonialSection";
import { ButtonLink, Eyebrow, Section } from "@/components/ui";
import { listPublishedConsultants } from "@/lib/db/queries";
import {
  consultancyVideoUrl,
  consultantFaqs,
  consultantTestimonials,
  consultingAudiences,
} from "@/lib/content/consultants";
import { photos } from "@/lib/images";
import { resolveMediaUrl } from "@/lib/storage/media";

export const metadata: Metadata = {
  title: "Best Business & Franchise Consultants",
  description:
    "Work with the best consultants for site selection, feasibility and franchise structuring — expansion advice for brands, franchisees and landlords.",
};

export default async function ConsultantsPage() {
  const consultants = await listPublishedConsultants();
  const withPhotos = await Promise.all(
    consultants.map(async (c) => ({ ...c, photoUrl: await resolveMediaUrl(c.photoUrl) })),
  );

  return (
    <>
      {/* Hero — the site's usual photo-backed audience header, but with two
          real CTAs instead of one jump-link, since this page has two
          equally-weighted entry points: talk to us now, or browse first. */}
      <section className="relative isolate overflow-hidden">
        <div className="relative flex min-h-[28rem] flex-col justify-end sm:min-h-[32rem]">
          <div className="absolute inset-0">
            <Photo
              photo={photos.planning}
              sizes="100vw"
              aspect="none"
              className="h-full"
              priority
              overlay="strong"
            />
          </div>
          <div className="shell relative pb-10 pt-28 sm:pb-14 sm:pt-32">
            <Reveal>
              <Eyebrow className="text-white/55">Consultants</Eyebrow>
            </Reveal>
            <Reveal i={1}>
              <h1 className="font-display display-lg mt-4 max-w-4xl text-balance text-white">
                Expansion decisions are easier with the right advice in the room.
              </h1>
            </Reveal>
            <Reveal i={2}>
              <p className="mt-5 max-w-xl leading-relaxed text-white/70 text-pretty">
                Site selection, feasibility and franchise structuring from
                consultants who work these categories every day.
              </p>
            </Reveal>
            <Reveal i={3}>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/contact" variant="onDark" size="lg">
                  Hire a Consultant
                </ButtonLink>
                <ButtonLink href="#listing" variant="outline" size="lg">
                  View available consultants
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* What our consultants are for — Connectors' own service, not a
          directory of outside vendors. */}
      <Section>
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>Consultancy, in-house</Eyebrow>
          </Reveal>
          <Reveal i={1}>
            <h2 className="font-display display-lg mt-4 text-balance">
              Advice from the people who do this for a living.
            </h2>
          </Reveal>
          <Reveal i={2}>
            <p className="mt-5 leading-relaxed text-[var(--muted)] text-pretty">
              We provide consultancy services directly to brands, franchisees
              and landlords — whether or not you're already working with
              Connectors on an expansion, a franchise or a property.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {consultingAudiences.map((a, i) => (
            <Reveal key={a.audience} i={i}>
              <div className="border-t border-[var(--border)] pt-5">
                <h3 className="font-display text-lg">{a.audience}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)] text-pretty">
                  {a.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Listing */}
      <Section id="listing" tone="sunken">
        <Reveal>
          <Eyebrow>Our consultants</Eyebrow>
        </Reveal>
        <Reveal i={1}>
          <h2 className="font-display display-lg mt-4 max-w-xl text-balance">
            Meet the team.
          </h2>
        </Reveal>

        <div className="mt-12">
          {withPhotos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] px-8 py-16 text-center">
              <p className="font-display text-xl">The roster is being finalised.</p>
              <p className="mx-auto mt-3 max-w-md leading-relaxed text-[var(--muted)] text-pretty">
                In the meantime, tell us what you need and we'll match you with
                the right person directly.
              </p>
              <div className="mt-8 flex justify-center">
                <ButtonLink href="/contact">Hire a Consultant</ButtonLink>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {withPhotos.map((c, i) => (
                <Reveal key={c.id} i={i % 3}>
                  <ConsultantCard
                    slug={c.slug ?? c.id}
                    name={c.name}
                    photoUrl={c.photoUrl}
                    expertise={c.expertise ?? []}
                    yearsExperience={c.yearsExperience}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Testimonials — see consultantTestimonials for the placeholder
          disclosure; replace with real, permissioned quotes before launch. */}
      <TestimonialSection
        heading="Advice people actually acted on."
        items={consultantTestimonials}
      />

      <FaqVideoSection
        heading="Before you get in touch."
        videoUrl={consultancyVideoUrl}
        videoTitle="How our consultancy works"
        faqs={consultantFaqs}
      />

      <CtaSection
        eyebrow="Hire a consultant"
        title="Tell us what you're deciding."
        body="Site selection, feasibility, franchise structuring — describe the decision in front of you and we'll tell you honestly whether a consultant can help."
        photo={photos.boardroom}
        secondary={{ href: "/solutions", label: "Explore our other services" }}
      />
    </>
  );
}
