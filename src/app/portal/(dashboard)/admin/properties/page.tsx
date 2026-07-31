import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/current-user";
import { listAllProperties } from "@/lib/db/queries";
import { ActionForm } from "@/components/portal/ActionForm";
import { ListToolbar, matchesQuery } from "@/components/portal/ListToolbar";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { EmptyState, ListRow, formatMoney } from "@/components/portal/ui";
import { Select } from "@/components/ui";
import { setPropertyStatus } from "@/lib/portal/actions";
import { PROPERTY_STATUS_LABEL, PROPERTY_TYPE_LABEL, orgTypeMeta } from "@/lib/portal/domain";

export const metadata: Metadata = {
  title: "Properties",
  robots: { index: false, follow: false },
};

const STATUS_OPTIONS = Object.entries(PROPERTY_STATUS_LABEL).map(([value, label]) => ({
  value,
  label,
}));

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireAdmin();
  const { q, status } = await searchParams;
  const allRows = await listAllProperties();
  const rows = allRows.filter(
    (property) =>
      matchesQuery(q, property.title, property.organizationName, property.city) &&
      (!status || property.status === status),
  );

  return (
    <div>
      <PortalHeader
        title="Properties"
        subtitle="All space listed by landlords and developers."
      />

      <ListToolbar
        action="/portal/admin/properties"
        placeholder="Search by title, owner or city…"
        query={q}
        statusOptions={STATUS_OPTIONS}
        statusValue={status}
      />

      <div className="space-y-2">
        {allRows.length === 0 ? (
          <EmptyState>No properties listed yet.</EmptyState>
        ) : rows.length === 0 ? (
          <EmptyState>No properties match that search.</EmptyState>
        ) : (
          rows.map((property) => {
            const rent = formatMoney(property.rentAmount, property.currency);
            const orgHref = `/portal/admin/${orgTypeMeta(property.organizationType).slug}/${property.organizationId}`;
            return (
              <ListRow
                key={property.id}
                // trailing holds a <form>, so the row itself isn't the link —
                // same reasoning as the accounts and org-type list pages.
                title={
                  <Link href={orgHref} className="hover:text-violet-600">
                    {property.title}
                  </Link>
                }
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
                  <ActionForm
                    action={setPropertyStatus}
                    submitLabel="Update"
                    pendingLabel="…"
                    successMessage="Updated."
                    hiddenFields={{ id: property.id }}
                    size="sm"
                    variant="secondary"
                    layout="inline"
                  >
                    <span className="w-36 shrink-0">
                      <Select name="status" defaultValue={property.status}>
                        {STATUS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </Select>
                    </span>
                  </ActionForm>
                }
              />
            );
          })
        )}
      </div>
    </div>
  );
}
