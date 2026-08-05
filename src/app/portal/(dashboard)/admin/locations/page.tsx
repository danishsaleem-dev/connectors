import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import { requireAdmin } from "@/lib/auth/current-user";
import { listAllProperties } from "@/lib/db/queries";
import { ActionForm } from "@/components/portal/ActionForm";
import { ListToolbar, matchesQuery } from "@/components/portal/ListToolbar";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { EmptyState, ListRow, formatMoney } from "@/components/portal/ui";
import { ButtonLink, Select } from "@/components/ui";
import { setPropertyStatus, toggleFeatured } from "@/lib/portal/actions";
import { PROPERTY_STATUS_LABEL, PROPERTY_TYPE_LABEL } from "@/lib/portal/domain";

export const metadata: Metadata = {
  title: "Locations",
  robots: { index: false, follow: false },
};

const STATUS_OPTIONS = Object.entries(PROPERTY_STATUS_LABEL).map(([value, label]) => ({
  value,
  label,
}));

export default async function AdminLocationsPage({
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
        title="Locations"
        subtitle="All space listed by landlords and agents."
        action={
          <ButtonLink href="/portal/admin/locations/new" size="sm">
            Add location
          </ButtonLink>
        }
      />

      <ListToolbar
        action="/portal/admin/locations"
        placeholder="Search by title, owner or city…"
        query={q}
        statusOptions={STATUS_OPTIONS}
        statusValue={status}
      />

      <div className="space-y-2">
        {allRows.length === 0 ? (
          <EmptyState>No locations listed yet.</EmptyState>
        ) : rows.length === 0 ? (
          <EmptyState>No locations match that search.</EmptyState>
        ) : (
          rows.map((property) => {
            const rent = formatMoney(property.rentAmount, property.currency);

            // Plain <form>, not an ActionForm — a single-icon fire-and-forget
            // toggle doesn't need pending/error UI, same reasoning as the
            // favorite star on the public LocationCard.
            async function toggleFeaturedAction(formData: FormData) {
              "use server";
              await toggleFeatured({ ok: false }, formData);
            }

            return (
              <ListRow
                key={property.id}
                // trailing holds forms, so the row itself isn't the link —
                // same reasoning as the accounts and org-type list pages.
                title={
                  <Link
                    href={`/portal/admin/locations/${property.id}`}
                    className="hover:text-violet-600"
                  >
                    {property.title}
                  </Link>
                }
                meta={[
                  property.organizationName,
                  property.city,
                  PROPERTY_TYPE_LABEL[property.propertyType] ?? property.propertyType,
                  property.sizeSqft ? `${property.sizeSqft.toLocaleString()} sq ft` : null,
                  property.dimensions,
                  rent ? `${rent}/mo` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                trailing={
                  <div className="flex items-center gap-3">
                    <form action={toggleFeaturedAction}>
                      <input type="hidden" name="id" value={property.id} />
                      <button
                        type="submit"
                        aria-label={property.featured ? "Remove from featured" : "Feature this listing"}
                        aria-pressed={property.featured}
                        title={property.featured ? "Featured" : "Feature this listing"}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:text-amber-500"
                      >
                        <Star
                          size={16}
                          className={property.featured ? "fill-amber-400 text-amber-400" : undefined}
                        />
                      </button>
                    </form>
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
                  </div>
                }
              />
            );
          })
        )}
      </div>
    </div>
  );
}
