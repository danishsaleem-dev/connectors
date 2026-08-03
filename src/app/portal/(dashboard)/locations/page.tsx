import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireParticipant } from "@/lib/auth/current-user";
import { listAllProperties, listFavoritePropertyIds } from "@/lib/db/queries";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PropertyCard } from "@/components/portal/PropertyCard";
import { EmptyState } from "@/components/portal/ui";

export const metadata: Metadata = {
  title: "Locations",
  robots: { index: false, follow: false },
};

/**
 * Brands only. Every listing landlords and developers have submitted, with
 * a favorite star and an "Enquire" button on each card — both post through
 * the normal server actions (toggleFavorite, createRequest), so pursuing a
 * listing still runs through the same request/notification path as every
 * other enquiry in the portal.
 */
export default async function ParticipantLocationsPage() {
  const { organization } = await requireParticipant();
  if (organization.type !== "brand") redirect("/portal");

  const [properties, favoriteIds] = await Promise.all([
    listAllProperties(),
    listFavoritePropertyIds(organization.id),
  ]);

  return (
    <div>
      <PortalHeader
        title="Locations"
        subtitle="Space listed by our landlord and developer partners."
      />

      {properties.length === 0 ? (
        <EmptyState>Nothing listed yet — check back soon.</EmptyState>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isFavorited={favoriteIds.has(property.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
