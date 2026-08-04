import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FaqVideoSection } from "@/components/FaqVideoSection";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { ServiceInquiryForm } from "@/components/ServiceInquiryForm";
import { VendorCta } from "@/components/VendorCta";
import { ButtonLink, Eyebrow, Section } from "@/components/ui";
import { getVendorService, vendorServices } from "@/lib/content/vendor-services";
import { photos, type Photo as PhotoData } from "@/lib/images";
import { INDUSTRIES } from "@/lib/portal/domain";

/** Kept here rather than in the content file, matching how divisions.ts and
 * /solutions/[slug] split content from imagery. Reuse across a couple of
 * services is deliberate — no two of these pages are seen side by side. */
const SERVICE_PHOTOS: Record<string, PhotoData> = {
  designers: photos.boutique,
  architects: photos.planning,
  "interior-specialists": photos.cafe,
  agencies: photos.analytics,
  consultants: photos.boardroom,
  contractors: photos.towers,
  accounts: photos.office,
  audit: photos.signing,
  "franchise-training": photos.boardroom,
  "customer-care-training": photos.checkout,
  advertisements: photos.mall,
  "project-handling": photos.planning,
};

export function generateStaticParams() {
  return vendorServices.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getVendorService(slug);
  if (!service) return {};

  return {
    title: service.title,
    description: service.body,
    alternates: { canonical: `/vendor-services/${service.slug}` },
  };
}

export default async function VendorServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getVendorService(slug);
  if (!service) notFound();

  const photo = SERVICE_PHOTOS[service.slug] ?? photos.office;
  const Icon = service.icon;

  return (
    <>
      {/* Full-bleed photo banner — same treatment as the catalog page and the
          homepage hero. */}
      <section className="relative isolate overflow-hidden">
        <div className="relative flex min-h-[28rem] flex-col justify-end sm:min-h-[34rem]">
          <div className="absolute inset-0">
            <Photo
              photo={photo}
              sizes="100vw"
              aspect="none"
              className="h-full"
              priority
              overlay="strong"
            />
          </div>
          <div className="shell relative pb-10 pt-28 sm:pb-14 sm:pt-32">
            <Reveal>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-sm">
                <Icon size={22} />
              </span>
            </Reveal>
            <Reveal i={1}>
              <Eyebrow className="mt-6 text-white/55">Vendor Services</Eyebrow>
            </Reveal>
            <Reveal i={2}>
              <h1 className="font-display display-lg mt-4 max-w-3xl text-balance text-white">
                {service.title}
              </h1>
            </Reveal>
            <Reveal i={3}>
              <p className="mt-5 max-w-2xl leading-relaxed text-white/70 text-pretty">
                {service.lead}
              </p>
            </Reveal>
            <Reveal i={4}>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="#enquire" variant="onDark" size="lg">
                  Enquire about this service
                </ButtonLink>
                <ButtonLink href="#what-we-do" variant="outline" size="lg">
                  What's involved
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <Section>
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>Who this is for</Eyebrow>
          </Reveal>
          <Reveal i={1}>
            <h2 className="font-display display-lg mt-4 text-balance">
              Who we provide this to.
            </h2>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {service.servedFor.map((entry, i) => (
            <Reveal key={entry.who} i={i}>
              <div className="border-t border-[var(--border)] pt-5">
                <h3 className="font-display text-lg leading-snug">{entry.who}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[var(--muted)] text-pretty">
                  {entry.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* What we do — each deliverable carries its own explanation rather than
          being a one-word checklist item, so the page says what the work is. */}
      <Section id="what-we-do" tone="sunken">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>What's involved</Eyebrow>
          </Reveal>
          <Reveal i={1}>
            <h2 className="font-display display-lg mt-4 text-balance">
              What we actually do.
            </h2>
          </Reveal>
          <Reveal i={2}>
            <p className="mt-5 leading-relaxed text-[var(--muted)] text-pretty">
              Delivered by vetted specialists from the Partners Program and
              coordinated by the Connectors team, so scope, cost and timeline
              arrive already agreed rather than negotiated as you go.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-x-16 gap-y-10 lg:grid-cols-2">
          {service.deliverables.map((item, i) => (
            <Reveal key={item.title} i={i % 2}>
              <div className="flex gap-5 border-t border-[var(--border)] pt-6">
                <span className="font-display text-xl tabular-nums text-violet-600/50">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-xl leading-snug">{item.title}</h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--muted)] text-pretty">
                    {item.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Industries — company-wide, so this reads from the same list the rest
          of the site uses rather than a per-service invention. */}
      <Section>
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>Industries</Eyebrow>
          </Reveal>
          <Reveal i={1}>
            <h2 className="font-display display-lg mt-4 text-balance">
              Industries we serve.
            </h2>
          </Reveal>
        </div>

        <Reveal i={2}>
          <div className="mt-10 flex flex-wrap gap-2.5">
            {INDUSTRIES.map((industry) => (
              <span
                key={industry}
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--muted)]"
              >
                {industry}
              </span>
            ))}
          </div>
        </Reveal>
      </Section>

      <FaqVideoSection
        heading={`${service.title}, answered.`}
        videoUrl={service.videoUrl ?? null}
        videoTitle={`${service.title} — how it works`}
        faqs={service.faqs}
      />

      <Section id="enquire">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-20">
          <div>
            <Reveal>
              <Eyebrow>Enquire</Eyebrow>
            </Reveal>
            <Reveal i={1}>
              <h2 className="font-display display-lg mt-4 text-balance">
                Ask us about {service.title.toLowerCase()}.
              </h2>
            </Reveal>
            <Reveal i={2}>
              <p className="mt-5 max-w-md leading-relaxed text-[var(--muted)] text-pretty">
                Tell us what you're planning — a single opening, a rollout, or
                a problem you're trying to solve — and we'll come back with who
                we'd bring in and what it would involve.
              </p>
            </Reveal>
          </div>

          <Reveal i={1}>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
              <ServiceInquiryForm
                subject={`Vendor service: ${service.title}`}
                placeholder={`What do you need from ${service.title.toLowerCase()}?`}
              />
            </div>
          </Reveal>
        </div>
      </Section>

      {/* The discipline goes in the body, not the title — de-pluralising the
          title to fit "are you a…" produces broken grammar on half of these
          ("a architect", "a audit"). */}
      <VendorCta
        title="Are you a vendor? Join the Connectors community."
        body={`We bring ${service.title.toLowerCase()} into brand openings across the UK, US and Pakistan. No fee to join, no subscription to stay — and your profile is never published publicly.`}
      />
    </>
  );
}
