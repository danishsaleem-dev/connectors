import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CtaSection } from "@/components/CtaSection";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { Eyebrow, Section } from "@/components/ui";
import { divisions } from "@/lib/content/divisions";
import { photos } from "@/lib/images";
import { audiences } from "@/lib/site";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Seven divisions covering brand expansion, franchise development, investor connections, mall and landlord services, marketing and franchise technology.",
  alternates: { canonical: "/solutions" },
};

const audienceLabel = Object.fromEntries(
  audiences.map((a) => [a.slug, a.nav]),
) as Record<string, string>;

export default function SolutionsPage() {
  return (
    <>
      <Section className="pt-32 md:pt-40">
        <div className="max-w-3xl">
          <Reveal>
            <Eyebrow>Our divisions</Eyebrow>
          </Reveal>
          <Reveal i={1}>
            <h1 className="font-display display-xl mt-5 text-balance">
              Seven divisions, one growth journey.
            </h1>
          </Reveal>
          <Reveal i={2}>
            <p className="mt-7 text-lg leading-relaxed text-[var(--muted)] text-pretty">
              Location, franchise, capital, mall placement, landlord matching,
              marketing and the technology that runs a network afterwards —
              under one platform, not five vendors who have never spoken to
              each other.
            </p>
          </Reveal>
        </div>
      </Section>

      <Section tone="sunken">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
          <Reveal
            as="div"
            className="relative col-span-1 hidden sm:col-span-2 lg:block lg:row-span-2"
          >
            <Photo
              photo={photos.datacentre}
              sizes="(min-width: 1024px) 34vw, 50vw"
              aspect="none"
              className="h-full"
              overlay="soft"
            />
            <p className="absolute bottom-6 left-6 right-6 font-display text-xl leading-snug text-white">
              Everything under one platform.
            </p>
          </Reveal>

          {divisions.map((division, i) => (
            <Link
              key={division.slug}
              href={`/solutions/${division.slug}`}
              className="group relative flex flex-col justify-between bg-[var(--background)] p-7 transition-colors duration-500 hover:bg-violet-50"
            >
              <Reveal i={i % 3}>
                <span className="font-display text-sm text-violet-600">
                  {division.index}
                </span>
                <h2 className="font-display mt-3 text-xl leading-snug">
                  {division.navLabel}
                </h2>
                <p className="mt-2.5 text-sm leading-relaxed text-[var(--muted)]">
                  {division.short}
                </p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {division.audiences.map((slug) => (
                    <span
                      key={slug}
                      className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] text-[var(--muted)]"
                    >
                      {audienceLabel[slug]}
                    </span>
                  ))}
                </div>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm text-violet-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  View division
                  <ArrowUpRight size={15} />
                </span>
              </Reveal>
            </Link>
          ))}
        </div>
      </Section>

      <CtaSection secondary={{ href: "/about", label: "More about Connectors" }} />
    </>
  );
}
