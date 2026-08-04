import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
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
                <ButtonLink href="/contact" variant="onDark" size="lg">
                  Request this service
                </ButtonLink>
                <ButtonLink href="/vendor-services" variant="outline" size="lg">
                  All vendor services
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

      {/* What's included */}
      <Section tone="sunken">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <Reveal>
              <Eyebrow>What's included</Eyebrow>
            </Reveal>
            <Reveal i={1}>
              <h2 className="font-display display-lg mt-4 text-balance">
                What we deliver.
              </h2>
            </Reveal>
            <Reveal i={2}>
              <p className="mt-5 max-w-md leading-relaxed text-[var(--muted)] text-pretty">
                Brought in through the Partners Program and coordinated by the
                Connectors team, so scope and timeline arrive already agreed.
              </p>
            </Reveal>
          </div>

          <ul className="grid gap-x-10 gap-y-1 sm:grid-cols-2">
            {service.details.map((item, i) => (
              <Reveal as="li" key={item} i={i % 6}>
                <div className="flex items-start gap-3 border-b border-[var(--border)] py-4">
                  <Check size={16} className="mt-0.5 shrink-0 text-violet-600" />
                  <span className="text-[15px] leading-relaxed">{item}</span>
                </div>
              </Reveal>
            ))}
          </ul>
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

      {/* The discipline goes in the body, not the title — de-pluralising the
          title to fit "are you a…" produces broken grammar on half of these
          ("a architect", "a audit"). */}
      <VendorCta
        title="Are you a vendor? Join the Connectors community."
        body={`We bring ${service.title.toLowerCase()} into brand openings across the UK, US and Pakistan. No fee to join, no subscription to stay — and your profile is never published publicly.`}
      />

      <Section className="!pt-0">
        <div className="border-t border-[var(--border)] pt-8">
          <Link
            href="/vendor-services"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted)] transition-colors hover:text-violet-600"
          >
            <ArrowLeft size={15} />
            All vendor services
          </Link>
        </div>
      </Section>
    </>
  );
}
