import type { Metadata } from "next";
import Link from "next/link";
import { clsx } from "clsx";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { ButtonLink, Eyebrow, Section } from "@/components/ui";
import { listPublishedVendors } from "@/lib/db/queries";
import { partnerDisciplines } from "@/lib/content/partners";
import { VENDOR_DISCIPLINE_LABEL, VENDOR_DISCIPLINE_PLURAL } from "@/lib/portal/domain";
import { resolveMediaUrl } from "@/lib/storage/media";

export const metadata: Metadata = {
  title: "Consultants & Partners",
  description:
    "Browse the designers, architects, interior specialists, agencies, consultants and contractors in the Connectors Partners Program.",
};

type VendorRow = Awaited<ReturnType<typeof listPublishedVendors>>[number];

export default async function ConsultantsPage({
  searchParams,
}: {
  searchParams: Promise<{ discipline?: string }>;
}) {
  const { discipline } = await searchParams;
  const active = discipline && VENDOR_DISCIPLINE_LABEL[discipline] ? discipline : undefined;
  const vendors = await listPublishedVendors(active);

  return (
    <>
      {/* Header — text-only rather than the photo hero the audience pages use;
          the cards below are the visual interest, and stacking a photo hero on
          top of a photo grid fights itself. */}
      <Section className="pt-32 md:pt-40">
        <div className="max-w-3xl">
          <Reveal>
            <Eyebrow>Partners Program</Eyebrow>
          </Reveal>
          <Reveal i={1}>
            <h1 className="font-display display-xl mt-5 text-balance">
              The bench behind every opening.
            </h1>
          </Reveal>
          <Reveal i={2}>
            <p className="mt-6 text-lg leading-relaxed text-[var(--muted)] text-pretty">
              Vetted designers, architects, interior specialists, agencies,
              consultants and contractors — the people our brands work with
              when a lease turns into a build.
            </p>
          </Reveal>
        </div>

        {/* Discipline filter — plain links, so this page stays a Server
            Component and every filter view is its own shareable URL. */}
        <Reveal i={3}>
          <div className="mt-10 flex flex-wrap gap-2">
            <FilterChip href="/consultants" label="All" active={!active} />
            {partnerDisciplines.map((d) => (
              <FilterChip
                key={d.key}
                href={`/consultants?discipline=${d.key}`}
                label={VENDOR_DISCIPLINE_PLURAL[d.key] ?? d.title}
                active={active === d.key}
              />
            ))}
          </div>
        </Reveal>

        <div className="mt-12">
          {vendors.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] px-8 py-16 text-center">
              <p className="font-display text-xl">
                {active
                  ? `No ${(VENDOR_DISCIPLINE_PLURAL[active] ?? "partners").toLowerCase()} listed yet.`
                  : "The directory is being built."}
              </p>
              <p className="mx-auto mt-3 max-w-md leading-relaxed text-[var(--muted)] text-pretty">
                We’re onboarding the first partners now. If you design, build
                or launch retail and franchise spaces, this is the moment to
                apply.
              </p>
              <div className="mt-8 flex justify-center">
                <ButtonLink href="/become-a-vendor">Become a vendor</ButtonLink>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {vendors.map((vendor, i) => (
                <Reveal key={vendor.organizationId} i={i % 3}>
                  <VendorCard vendor={vendor} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </Section>

      <Section tone="sunken">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <Eyebrow>Join them</Eyebrow>
          </Reveal>
          <Reveal i={1}>
            <h2 className="font-display display-lg mt-4 text-balance">
              Work that arrives already briefed.
            </h2>
          </Reveal>
          <Reveal i={2}>
            <p className="mt-5 leading-relaxed text-[var(--muted)] text-pretty">
              No fee to join, no charge to be listed. We make our money on the
              expansion deal — not on our partners.
            </p>
          </Reveal>
          <Reveal i={3}>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/become-a-vendor">Become a vendor</ButtonLink>
              <ButtonLink href="/partners" variant="secondary">
                About the programme
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "rounded-full border px-4 py-2 text-sm transition-colors",
        active
          ? "border-violet-600 bg-violet-600 text-white"
          : "border-[var(--border)] text-[var(--muted)] hover:border-violet-400 hover:text-violet-600",
      )}
    >
      {label}
    </Link>
  );
}

async function VendorCard({ vendor }: { vendor: VendorRow }) {
  const [logo, cover] = await Promise.all([
    resolveMediaUrl(vendor.logoUrl),
    resolveMediaUrl(vendor.coverUrl),
  ]);

  return (
    <Link
      href={`/consultants/${vendor.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition-all hover:border-violet-400 hover:shadow-[0_28px_56px_-32px_rgba(20,20,26,0.35)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--surface-sunken)]">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element -- private signed Storage URL
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-3xl text-[var(--muted)]/40">
              {vendor.name.charAt(0)}
            </span>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-ink backdrop-blur-sm">
          {VENDOR_DISCIPLINE_LABEL[vendor.discipline] ?? vendor.discipline}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-3">
          {logo && (
            // eslint-disable-next-line @next/next/no-img-element -- private signed Storage URL
            <img
              src={logo}
              alt=""
              className="h-10 w-10 shrink-0 rounded-lg border border-[var(--border)] bg-white object-contain"
            />
          )}
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg">{vendor.name}</h3>
            {vendor.citiesServed && vendor.citiesServed.length > 0 && (
              <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-[var(--muted)]">
                <MapPin size={11} className="shrink-0" />
                {vendor.citiesServed.slice(0, 3).join(" · ")}
              </p>
            )}
          </div>
        </div>

        {vendor.headline && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--muted)] text-pretty">
            {vendor.headline}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-5">
          <div className="flex gap-4 text-xs text-[var(--muted)]">
            {vendor.yearsExperience != null && (
              <span>
                <strong className="font-medium text-[var(--foreground)]">
                  {vendor.yearsExperience}
                </strong>{" "}
                yrs
              </span>
            )}
            {vendor.projectsCompleted != null && (
              <span>
                <strong className="font-medium text-[var(--foreground)]">
                  {vendor.projectsCompleted}
                </strong>{" "}
                projects
              </span>
            )}
          </div>
          <ArrowUpRight
            size={16}
            className="text-[var(--muted)] transition-colors group-hover:text-violet-600"
          />
        </div>
      </div>
    </Link>
  );
}
