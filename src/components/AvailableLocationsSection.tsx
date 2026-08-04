import { getCurrentContext } from "@/lib/auth/current-user";
import { listAllProperties } from "@/lib/db/queries";
import { resolveMediaUrls } from "@/lib/storage/media";
import { LocationCard } from "@/components/LocationCard";
import { Reveal } from "@/components/Reveal";
import { ButtonLink, Eyebrow, Section } from "@/components/ui";

const PREVIEW_COUNT = 6;

/**
 * Embeds the same browsing experience as the public /available-locations
 * page — same LocationCard, same brand-only gating (blurred image + locked
 * modal for anyone not signed in as a brand) — as a preview on an audience
 * page, rather than duplicating the full list. Links out to the full page
 * when there's more to see than the preview shows.
 */
export async function AvailableLocationsSection() {
  const context = await getCurrentContext();
  const viewerIsBrand = context?.organization?.type === "brand";

  const all = await listAllProperties();
  const available = all.filter((p) => p.status === "available");
  const preview = available.slice(0, PREVIEW_COUNT);
  const locations = await Promise.all(
    preview.map(async (p) => ({
      ...p,
      photoUrls: await resolveMediaUrls(p.photos ?? []),
    })),
  );

  return (
    <Section id="locations" tone="sunken">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>Available Locations</Eyebrow>
          </Reveal>
          <Reveal i={1}>
            <h2 className="font-display display-lg mt-4 text-balance">
              Space that's ready for the right brand.
            </h2>
          </Reveal>
        </div>
        {available.length > PREVIEW_COUNT && (
          <Reveal i={2}>
            <ButtonLink href="/available-locations" variant="secondary">
              View all locations
            </ButtonLink>
          </Reveal>
        )}
      </div>

      <div className="mt-12">
        {locations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] px-8 py-16 text-center">
            <p className="font-display text-xl">Nothing available right now.</p>
            <p className="mx-auto mt-3 max-w-md leading-relaxed text-[var(--muted)] text-pretty">
              New space gets listed regularly — check back soon, or tell us
              what you're looking for below.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {locations.map((loc, i) => (
              <Reveal key={loc.id} i={i % 3}>
                <LocationCard location={loc} viewerIsBrand={viewerIsBrand} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
