import type { Metadata } from "next";
import { getCurrentContext } from "@/lib/auth/current-user";
import { listAllProperties } from "@/lib/db/queries";
import { LocationCard } from "@/components/LocationCard";
import { Reveal } from "@/components/Reveal";
import { Eyebrow, Section } from "@/components/ui";
import { resolveMediaUrls } from "@/lib/storage/media";

export const metadata: Metadata = {
  title: "Available Locations",
  description:
    "Browse retail and commercial space currently available through Connectors — sign in as a brand for full details and to enquire.",
};

export default async function AvailableLocationsPage() {
  const context = await getCurrentContext();
  const viewerIsBrand = context?.organization?.type === "brand";

  const all = await listAllProperties();
  const available = all.filter((p) => p.status === "available");
  const locations = await Promise.all(
    available.map(async (p) => ({
      ...p,
      photoUrls: await resolveMediaUrls(p.photos ?? []),
    })),
  );

  return (
    <>
      <Section className="pt-32 md:pt-40">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>Available Locations</Eyebrow>
          </Reveal>
          <Reveal i={1}>
            <h1 className="font-display display-xl mt-5 text-balance">
              Space that's ready for the right brand.
            </h1>
          </Reveal>
          <Reveal i={2}>
            <p className="mt-6 text-lg leading-relaxed text-[var(--muted)] text-pretty">
              {viewerIsBrand
                ? "Every space currently listed with Connectors. Open any card for the full profile and to enquire directly."
                : "A look at what's currently listed. Full details and enquiries are reserved for brand accounts — sign in or create one to unlock a listing."}
            </p>
          </Reveal>
        </div>
      </Section>

      <Section tone="sunken">
        {locations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] px-8 py-16 text-center">
            <p className="font-display text-xl">Nothing available right now.</p>
            <p className="mx-auto mt-3 max-w-md leading-relaxed text-[var(--muted)] text-pretty">
              New space gets listed regularly — check back soon, or tell us what you're looking for.
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
      </Section>
    </>
  );
}
