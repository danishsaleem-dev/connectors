import type { Metadata } from "next";
import { ArrowDown } from "lucide-react";
import { BrandEnquiryForm } from "@/components/forms/BrandEnquiryForm";
import { FaqList } from "@/components/Faq";
import { Marquee } from "@/components/Marquee";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { Eyebrow, Section } from "@/components/ui";
import { industries } from "@/lib/content/company";
import { divisionsForAudience } from "@/lib/content/divisions";
import { faqs } from "@/lib/content/faq";
import { photos } from "@/lib/images";
import { audiences } from "@/lib/site";

const audience = audiences.find((a) => a.slug === "for-brands")!;
const relevantDivisions = divisionsForAudience("for-brands");

export const metadata: Metadata = {
  title: "For Brands",
  description:
    "Location sourcing, franchise development, investor connections and marketing — everything a brand needs to expand, in one request.",
};

export default function ForBrandsPage() {
  return (
    <>
      {/* ---------------------------------------------------------- */}
      {/*  Page header                                                 */}
      {/* ---------------------------------------------------------- */}
      {/* pt-28/md:pt-32 is deliberately more than the header's own height
          (h-16/md:h-20 unscrolled, ~64-80px) — a comfortable buffer, not a
          knife-edge match, since the header is a permanent solid bar (not
          transparent-over-hero like the homepage) and content must never
          render underneath it. */}
      <section className="relative isolate overflow-hidden">
        <div className="relative h-[52vh] min-h-[38rem]">
          <Photo
            photo={photos.boutique}
            sizes="100vw"
            aspect="none"
            className="h-full"
            priority
            overlay="strong"
          />
          <div className="shell absolute inset-x-0 bottom-0 pb-14">
            <Reveal>
              <Eyebrow className="text-white/55">For Brands</Eyebrow>
            </Reveal>
            <Reveal i={1}>
              <h1 className="font-display display-lg mt-4 max-w-4xl text-balance text-white">
                {audience.lead}
              </h1>
            </Reveal>
            <Reveal i={2}>
              <a
                href="#request-form"
                className="mt-8 inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/60 transition-colors hover:text-white"
              >
                <ArrowDown size={14} />
                Start your expansion request
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  What Connectors does for a brand                            */}
      {/* ---------------------------------------------------------- */}
      <Section>
        <Reveal>
          <Eyebrow>How we work with brands</Eyebrow>
        </Reveal>
        <Reveal i={1}>
          <h2 className="font-display display-lg mt-4 max-w-2xl text-balance">
            Five divisions, one expansion request.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
          {relevantDivisions.map((division, i) => (
            <Reveal
              as="div"
              key={division.slug}
              i={i % 3}
              className="bg-[var(--background)] p-7"
            >
              <span className="font-display text-sm text-violet-600">
                {division.index}
              </span>
              <h3 className="font-display mt-3 text-xl leading-snug">
                {division.navLabel}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[var(--muted)]">
                {division.short}
              </p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------------- */}
      {/*  Industries                                                  */}
      {/* ---------------------------------------------------------- */}
      <section className="border-y border-[var(--border)] py-16">
        <div className="shell">
          <Reveal>
            <Eyebrow>Industries we serve</Eyebrow>
          </Reveal>
        </div>
        <Marquee className="mt-8" duration="55s">
          {industries.map((industry) => (
            <span
              key={industry}
              className="font-display mx-8 whitespace-nowrap text-3xl text-[var(--muted)] md:text-4xl"
            >
              {industry}
              <span className="ml-8 text-violet-600/40">·</span>
            </span>
          ))}
        </Marquee>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  FAQ                                                         */}
      {/* ---------------------------------------------------------- */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Reveal>
              <Eyebrow>Questions</Eyebrow>
            </Reveal>
            <Reveal i={1}>
              <h2 className="font-display display-lg mt-4 text-balance">
                Before you fill out the form.
              </h2>
            </Reveal>
          </div>
          <Reveal i={1}>
            <FaqList items={faqs} />
          </Reveal>
        </div>
      </Section>

      {/* ---------------------------------------------------------- */}
      {/*  The request form                                            */}
      {/* ---------------------------------------------------------- */}
      <Section id="request-form" tone="sunken">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <Eyebrow>Brand expansion request</Eyebrow>
          </Reveal>
          <Reveal i={1}>
            <h2 className="font-display display-lg mt-4 text-balance">
              Tell us what you're looking to open, and where.
            </h2>
          </Reveal>
          <Reveal i={2}>
            <p className="mt-5 leading-relaxed text-[var(--muted)] text-pretty">
              The more detail you give us here, the faster we can match real
              locations and franchise candidates against it. Every field marked{" "}
              <span className="text-violet-400">*</span> is required — the
              rest is optional.
            </p>
          </Reveal>

          <Reveal i={3} className="mt-10">
            <BrandEnquiryForm />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
