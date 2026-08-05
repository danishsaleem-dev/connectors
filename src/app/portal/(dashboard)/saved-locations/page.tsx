import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireParticipant } from "@/lib/auth/current-user";
import { listAllProperties, listFavoritePropertyIds } from "@/lib/db/queries";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PropertyCard } from "@/components/portal/PropertyCard";
import { EmptyState } from "@/components/portal/ui";

export const metadata: Metadata = {
  title: "Saved Locations",
  robots: { index: false, follow: false },
};

/**
 * Brands only, same gate as /portal/locations — everything here is just
 * that same listing set filtered down to whatever the brand has hearted,
 * on the Locations page or the public site's LocationCard alike, since both
 * write to the same propertyFavorites row.
 */
export default async function SavedLocationsPage() {
  const { organization } = await requireParticipant();
  if (organization.type !== "brand") redirect("/portal");

  const [properties, favoriteIds] = await Promise.all([
    listAllProperties(),
    listFavoritePropertyIds(organization.id),
  ]);
  const saved = properties.filter((property) => favoriteIds.has(property.id));

  return (
    <div>
      <PortalHeader
        title="Saved Locations"
        subtitle="Listings you've saved to come back to."
      />

      {saved.length === 0 ? (
        <EmptyState>
          Nothing saved yet — tap the heart on a listing, in Locations or on the public site, to
          save it here.
        </EmptyState>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((property) => (
            <PropertyCard key={property.id} property={property} isFavorited />
          ))}
        </div>
      )}
    </div>
  );
}
