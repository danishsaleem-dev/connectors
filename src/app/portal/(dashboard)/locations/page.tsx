import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireParticipant } from "@/lib/auth/current-user";
import { listAllProperties } from "@/lib/db/queries";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { EmptyState, Panel, Pill, formatMoney } from "@/components/portal/ui";
import { PROPERTY_STATUS_LABEL, PROPERTY_TYPE_LABEL } from "@/lib/portal/domain";

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
        <div className="space-y-4">
          {properties.map((property) => {
            const rent = formatMoney(property.rentAmount, property.currency);
            return (
              <Panel key={property.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{property.title}</p>
                      <Pill tone={property.status === "available" ? "green" : "neutral"}>
                        {PROPERTY_STATUS_LABEL[property.status] ?? property.status}
                      </Pill>
                    </div>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {[
                        PROPERTY_TYPE_LABEL[property.propertyType],
                        [property.area, property.city, property.country]
                          .filter(Boolean)
                          .join(", "),
                        property.sizeSqft ? `${property.sizeSqft.toLocaleString()} sq ft` : null,
                        property.floorLevel,
                        property.parkingAvailable ? "Parking available" : null,
                        rent ? `${rent}/${property.rentPeriod ?? "mo"}` : null,
                        property.availableFrom ? `from ${property.availableFrom}` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {property.description && (
                      <p className="mt-2 whitespace-pre-wrap text-sm">{property.description}</p>
                    )}
                    {(property.photos?.length || property.video) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {property.photos?.map((url) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-violet-600 underline underline-offset-4"
                          >
                            Photo
                          </a>
                        ))}
                        {property.video && (
                          <a
                            href={property.video}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-violet-600 underline underline-offset-4"
                          >
                            Video
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}
