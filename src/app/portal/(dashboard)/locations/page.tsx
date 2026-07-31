import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireParticipant } from "@/lib/auth/current-user";
import { listAllProperties } from "@/lib/db/queries";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PropertyCard } from "@/components/portal/PropertyCard";
import { EmptyState } from "@/components/portal/ui";

export const metadata: Metadata = {
  title: "Locations",
  robots: { index: false, follow: false },
};

/**
 * Read-only, for brands only. This is deliberately the one place a brand
 * sees anything beyond its own profile — the listings landlords and
 * developers have submitted. There's no "interested" or "contact" action
 * here: no module talks to another in this portal, so if a listing is worth
 * pursuing, that happens the normal way — a message to your Connectors
 * contact, not an in-app introduction.
 */
export default async function ParticipantLocationsPage() {
  const { organization } = await requireParticipant();
  if (organization.type !== "brand") redirect("/portal");

  const properties = await listAllProperties();

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
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
