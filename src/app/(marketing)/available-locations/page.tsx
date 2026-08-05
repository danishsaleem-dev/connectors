import type { Metadata } from "next";
import { Suspense } from "react";
import { getCurrentContext } from "@/lib/auth/current-user";
import { getLocationStats, listAllProperties, listFavoritePropertyIds } from "@/lib/db/queries";
import { LocationCard, LOCATION_CARD_WIDTH } from "@/components/LocationCard";
import { LocationsFilterBar } from "@/components/LocationsFilterBar";
import { matchesLocationFilters, type LocationFilters } from "@/lib/location-filters";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { Eyebrow, Section } from "@/components/ui";
import { photos } from "@/lib/images";
import { resolveMediaUrls } from "@/lib/storage/media";

export const metadata: Metadata = {
  title: "Available Locations",
  description:
    "Browse retail and commercial space currently available through Connectors — sign in as a brand for full details and to enquire.",
};

export default async function AvailableLocationsPage({
  searchParams,
}: {
  searchParams: Promise<LocationFilters>;
}) {
  // Only the hero's copy depends on viewer state, and that's a fast session
  // check with no Storage calls — cheap enough to keep in the initial
  // render rather than adding a second Suspense boundary for it.
  const context = await getCurrentContext();
  const viewerIsBrand = context?.organization?.type === "brand";
  const organizationId = context?.organization?.id;
  const [filters, stats] = await Promise.all([searchParams, getLocationStats()]);

  return (
    <>
      {/* Full-bleed photo banner — same photo-hero treatment as the rest of
          the site, plus a live stat strip specific to this page: numbers a
          listings page should lead with, not the audience-page copy this
          section used to just borrow. */}
      <section className="relative isolate overflow-hidden">
        <div className="relative flex min-h-[30rem] flex-col justify-end sm:min-h-[36rem]">
          <div className="absolute inset-0">
            <Photo
              photo={photos.mall}
              sizes="100vw"
              aspect="none"
              className="h-full"
              priority
              overlay="strong"
            />
          </div>
          <div className="shell relative pb-10 pt-28 sm:pb-14 sm:pt-32">
            <Reveal>
              <Eyebrow className="text-white/55">Available Locations</Eyebrow>
            </Reveal>
            <Reveal i={1}>
              <h1 className="font-display display-lg mt-4 max-w-3xl text-balance text-white">
                Space that's ready for the right brand.
              </h1>
            </Reveal>
            <Reveal i={2}>
              <p className="mt-5 max-w-xl leading-relaxed text-white/70 text-pretty">
                {viewerIsBrand
                  ? "Every space currently listed with Connectors. Open any card for the full profile and to enquire directly."
                  : "A look at what's currently listed. Full details and enquiries are reserved for brand accounts — sign in or create one to unlock a listing."}
              </p>
            </Reveal>
            <Reveal i={3}>
              <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/15 pt-6">
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/50">
                    Listed with Connectors
                  </dt>
                  <dd className="font-display mt-1 text-3xl text-white">{stats.total}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/50">
                    Cities
                  </dt>
                  <dd className="font-display mt-1 text-3xl text-white">{stats.cities}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/50">
                    Updated
                  </dt>
                  <dd className="font-display mt-1 text-3xl text-white">Daily</dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      <Section id="listings" tone="sunken">
        {/* Boundaried separately from the hero above — resolving every
            photo to a signed Storage URL is a real network round-trip per
            image, and streaming just this grid in keeps the rest of the
            page from waiting on it. */}
        <Suspense fallback={<LocationsSkeleton />}>
          <LocationsGrid viewerIsBrand={viewerIsBrand} organizationId={organizationId} filters={filters} />
        </Suspense>
      </Section>
    </>
  );
}

async function LocationsGrid({
  viewerIsBrand,
  organizationId,
  filters,
}: {
  viewerIsBrand: boolean;
  organizationId?: string;
  filters: LocationFilters;
}) {
  const [all, favoriteIds] = await Promise.all([
    listAllProperties(),
    organizationId ? listFavoritePropertyIds(organizationId) : Promise.resolve(new Set<string>()),
  ]);
  // Withdrawn listings are never publicly browsable; every other status is
  // filterable via the "Availability" select above.
  const pool = all.filter((p) => p.status !== "withdrawn");
  const cities = Array.from(new Set(pool.map((p) => p.city))).sort((a, b) => a.localeCompare(b));
  const filtered = pool.filter((p) => matchesLocationFilters(p, filters));
  const locations = await Promise.all(
    filtered.map(async (p) => ({
      ...p,
      photoUrls: await resolveMediaUrls(p.photos ?? []),
    })),
  );

  return (
    <>
      <LocationsFilterBar key={JSON.stringify(filters)} cities={cities} filters={filters} />

      {locations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] px-8 py-16 text-center">
          <p className="font-display text-xl">
            {pool.length === 0 ? "Nothing available right now." : "No locations match those filters."}
          </p>
          <p className="mx-auto mt-3 max-w-md leading-relaxed text-[var(--muted)] text-pretty">
            {pool.length === 0
              ? "New space gets listed regularly — check back soon, or tell us what you're looking for."
              : "Try widening your search, or clear a filter to see more space."}
          </p>
        </div>
      ) : (
        /* Flex-wrap rather than a fixed grid: a partial last row centres itself
           instead of hanging off the left edge with dead space beside it, which
           is what any listing count that isn't a multiple of four produces. */
        <div className="flex flex-wrap justify-center gap-5">
          {locations.map((loc, i) => (
            <Reveal key={loc.id} i={i % 4} className={LOCATION_CARD_WIDTH}>
              <LocationCard
                location={loc}
                viewerIsBrand={viewerIsBrand}
                isFavorited={favoriteIds.has(loc.id)}
              />
            </Reveal>
          ))}
        </div>
      )}
    </>
  );
}

function LocationsSkeleton() {
  return (
    <div className="flex flex-wrap justify-center gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className={`${LOCATION_CARD_WIDTH} animate-pulse overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]`}
        >
          <div className="aspect-[4/3] bg-[var(--surface-sunken)]" />
          <div className="space-y-2.5 p-4">
            <div className="h-4 w-2/3 rounded bg-[var(--surface-sunken)]" />
            <div className="h-3 w-1/3 rounded bg-[var(--surface-sunken)]" />
          </div>
        </div>
      ))}
    </div>
  );
}
