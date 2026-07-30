import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { requireParticipant } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db/client";
import { properties } from "@/lib/db/schema";
import { ActionForm } from "@/components/portal/ActionForm";
import { AddressPicker } from "@/components/portal/AddressPicker";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PropertyMedia } from "@/components/portal/PropertyMedia";
import { PropertyMediaFields } from "@/components/portal/PropertyMediaFields";
import { EmptyState, Panel, Pill, formatMoney } from "@/components/portal/ui";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui";
import { deleteProperty, saveProperty } from "@/lib/portal/actions";
import { PROPERTY_STATUS_LABEL, PROPERTY_TYPE_LABEL, orgTypeMeta } from "@/lib/portal/domain";

export const metadata: Metadata = {
  title: "My properties",
  robots: { index: false, follow: false },
};

export default async function ParticipantPropertiesPage() {
  const { organization } = await requireParticipant();
  const meta = orgTypeMeta(organization.type);
  // Only landlords and developers list space.
  if (!meta.listsProperties) redirect("/portal");

  const rows = await getDb()
    .select()
    .from(properties)
    .where(eq(properties.organizationId, organization.id))
    .orderBy(desc(properties.createdAt));

  return (
    <div>
      <PortalHeader
        title="My properties"
        subtitle="List available space. Brands can browse everything listed here."
      />

      <Panel title="Add a property">
        <ActionForm
          action={saveProperty}
          submitLabel="Add property"
          pendingLabel="Adding…"
          successMessage="Property added."
        >
          <Field label="Title" className="sm:col-span-2">
            <Input name="title" required placeholder="e.g. Ground floor unit, Mount Row" />
          </Field>
          <Field label="Type">
            <Select name="propertyType" defaultValue="retail_shop">
              {Object.entries(PROPERTY_TYPE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select name="status" defaultValue="available">
              {Object.entries(PROPERTY_STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Area / district">
            <Input name="area" />
          </Field>
          <AddressPicker />
          <Field label="Size (sq ft)">
            <Input name="sizeSqft" type="number" />
          </Field>
          <Field label="Floor level" hint="e.g. Ground floor, 2nd floor">
            <Input name="floorLevel" />
          </Field>
          <Field label="Rent per month">
            <Input name="rentAmount" type="number" />
          </Field>
          <Field label="Available from" hint="e.g. Immediately, or a date">
            <Input name="availableFrom" />
          </Field>
          <div className="flex items-end pb-2 sm:col-span-2">
            <Checkbox name="parkingAvailable" label="Parking available" />
          </div>
          <Field label="Description" className="sm:col-span-2">
            <Textarea name="description" rows={3} />
          </Field>
          <PropertyMediaFields organizationId={organization.id} />
        </ActionForm>
      </Panel>

      <div className="mt-8 space-y-4">
        {rows.length === 0 ? (
          <EmptyState>No properties listed yet.</EmptyState>
        ) : (
          rows.map((property) => {
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
                        property.sizeSqft
                          ? `${property.sizeSqft.toLocaleString()} sq ft`
                          : null,
                        property.floorLevel,
                        property.parkingAvailable ? "Parking available" : null,
                        rent ? `${rent}/mo` : null,
                        property.availableFrom ? `from ${property.availableFrom}` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {property.description && (
                      <p className="mt-2 whitespace-pre-wrap text-sm">{property.description}</p>
                    )}
                    <PropertyMedia photos={property.photos} video={property.video} />
                  </div>

                  <ActionForm
                    action={deleteProperty}
                    submitLabel="Remove"
                    pendingLabel="Removing…"
                    successMessage="Removed."
                    hiddenFields={{ id: property.id }}
                    size="sm"
                    variant="secondary"
                    className="shrink-0 sm:grid-cols-1"
                  />
                </div>
              </Panel>
            );
          })
        )}
      </div>
    </div>
  );
}
