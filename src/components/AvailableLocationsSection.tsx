import { Suspense } from "react";
import { getCurrentContext } from "@/lib/auth/current-user";
import { listAllProperties, listFavoritePropertyIds } from "@/lib/db/queries";
import { resolveMediaUrls } from "@/lib/storage/media";
import { LocationCard, LOCATION_CARD_WIDTH } from "@/components/LocationCard";
import { Reveal } from "@/components/Reveal";
import { Eyebrow, Section } from "@/components/ui";

// Two full rows of the four-across grid.
const PREVIEW_COUNT = 8;

/**
 * Embeds the same browsing experience as the public /available-locations
 * page — same LocationCard, same brand-only gating (locked overlay on the
 * photo + locked modal for anyone not signed in as a brand) — as a preview
 * on an audience page, rather than duplicating the full list. Links out to
 * the full page when there's more to see than the preview shows.
 *
 * The listing/image-resolving work is Suspense-boundaried into its own
 * child so a slow Supabase round-trip (signing every photo, one Storage
 * call each) only delays this one section streaming in — not the whole
 * page, which would otherwise wait on it before responding at all.
 */
export function AvailableLocationsSection() {
  return (
    <Section id="locations" tone="sunken">
      <div className="max-w-2xl">
        <Reveal>
          <Eyebrow>Available Locations</Eyebrow>
        </Reveal>
        <Reveal i={1}>
          <h2 className="font-display display-lg mt-4 text-balance">
            Space that's ready for the right brand.
          </h2>
        </Reveal>
        <Reveal i={2}>
          <p className="mt-5 leading-relaxed text-[var(--muted)] text-pretty">
            A look at what's currently listed with Connectors — sign in as a
            brand to see the full profile on any of these and enquire
            directly.
          </p>
        </Reveal>
      </div>

      <Suspense fallback={<LocationsSkeleton />}>
        <LocationsGrid />
      </Suspense>
    </Section>
  );
}

async function LocationsGrid() {
  const context = await getCurrentContext();
  const viewerIsBrand = context?.organization?.type === "brand";
  const organizationId = context?.organization?.id;

  const [all, favoriteIds] = await Promise.all([
    listAllProperties(),
    organizationId ? listFavoritePropertyIds(organizationId) : Promise.resolve(new Set<string>()),
  ]);
  const available = all.filter((p) => p.status === "available");
  const preview = available.slice(0, PREVIEW_COUNT);
  const locations = await Promise.all(
    preview.map(async (p) => ({
      ...p,
      photoUrls: await resolveMediaUrls(p.photos ?? []),
    })),
  );

  return (
    <>
      {available.length > PREVIEW_COUNT && (
        <Reveal i={3}>
          <div className="mt-6">
            <a
              href="/available-locations"
              className="inline-flex items-center gap-1.5 text-sm text-violet-600 underline underline-offset-4"
            >
              View all locations
            </a>
          </div>
        </Reveal>
      )}

      <div className="mt-8">
        {locations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] px-8 py-16 text-center">
            <p className="font-display text-xl">Nothing available right now.</p>
            <p className="mx-auto mt-3 max-w-md leading-relaxed text-[var(--muted)] text-pretty">
              New space gets listed regularly — check back soon, or tell us
              what you're looking for below.
            </p>
          </div>
        ) : (
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
      </div>
    </>
  );
}

function LocationsSkeleton() {
  return (
    <div className="mt-8 flex flex-wrap justify-center gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
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
