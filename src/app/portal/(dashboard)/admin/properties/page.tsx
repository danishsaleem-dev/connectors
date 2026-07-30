import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/current-user";
import { listAllProperties } from "@/lib/db/queries";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { EmptyState, ListRow, Pill, formatMoney } from "@/components/portal/ui";
import { PROPERTY_STATUS_LABEL, PROPERTY_TYPE_LABEL } from "@/lib/portal/domain";

export const metadata: Metadata = {
  title: "Properties",
  robots: { index: false, follow: false },
};

export default async function AdminPropertiesPage() {
  await requireAdmin();
  const rows = await listAllProperties();

  return (
    <div>
      <PortalHeader
        title="Properties"
        subtitle="All space listed by landlords and developers."
      />

      <div className="space-y-2">
        {rows.length === 0 ? (
          <EmptyState>No properties listed yet.</EmptyState>
        ) : (
          rows.map((property) => {
            const rent = formatMoney(property.rentAmount, property.currency);
            return (
              <ListRow
                key={property.id}
                title={property.title}
                meta={[
                  property.organizationName,
                  property.city,
                  PROPERTY_TYPE_LABEL[property.propertyType] ?? property.propertyType,
                  property.sizeSqft ? `${property.sizeSqft.toLocaleString()} sq ft` : null,
                  rent ? `${rent}/mo` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                trailing={
                  <Pill tone={property.status === "available" ? "green" : "neutral"}>
                    {PROPERTY_STATUS_LABEL[property.status] ?? property.status}
                  </Pill>
                }
              />
            );
          })
        )}
      </div>
    </div>
  );
}
