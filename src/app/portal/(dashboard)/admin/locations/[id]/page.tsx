import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db/client";
import { properties } from "@/lib/db/schema";
import { listPropertyOwners } from "@/lib/db/queries";
import { ActionForm } from "@/components/portal/ActionForm";
import { AddressPicker } from "@/components/portal/AddressPicker";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PropertyMedia } from "@/components/portal/PropertyMedia";
import { PropertyMediaFields } from "@/components/portal/PropertyMediaFields";
import { Panel } from "@/components/portal/ui";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui";
import { deleteProperty, saveProperty } from "@/lib/portal/actions";
import { PROPERTY_STATUS_LABEL, PROPERTY_TYPE_LABEL } from "@/lib/portal/domain";

export const metadata: Metadata = {
  title: "Edit location",
  robots: { index: false, follow: false },
};

export default async function AdminLocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [location] = await getDb().select().from(properties).where(eq(properties.id, id)).limit(1);
  if (!location) notFound();

  const owners = await listPropertyOwners();

  return (
    <div>
      <PortalHeader
        title={location.title}
        subtitle={
          <Link href="/portal/admin/locations" className="hover:text-violet-600">
            ← Back to locations
          </Link>
        }
      />

      <Panel>
        <ActionForm action={saveProperty} submitLabel="Save changes" hiddenFields={{ id: location.id }}>
          <Field label="Landlord / Agent" className="sm:col-span-2">
            <Select name="organizationId" required defaultValue={location.organizationId}>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Title" className="sm:col-span-2">
            <Input name="title" defaultValue={location.title} required />
          </Field>
          <Field label="Type">
            <Select name="propertyType" defaultValue={location.propertyType}>
              {Object.entries(PROPERTY_TYPE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select name="status" defaultValue={location.status}>
              {Object.entries(PROPERTY_STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Area / district">
            <Input name="area" defaultValue={location.area ?? ""} />
          </Field>
          <AddressPicker
            defaults={{
              city: location.city,
              country: location.country ?? undefined,
              mapAddress: location.mapAddress ?? undefined,
            }}
          />
          <Field label="Size (sq ft)">
            <Input name="sizeSqft" type="number" defaultValue={location.sizeSqft ?? ""} />
          </Field>
          <Field label="Dimensions" hint="e.g. 40ft x 60ft">
            <Input name="dimensions" defaultValue={location.dimensions ?? ""} />
          </Field>
          <div className="flex flex-wrap items-end gap-x-6 gap-y-2 pb-2 sm:col-span-2">
            <Checkbox
              name="parkingAvailable"
              label="Parking available"
              defaultChecked={location.parkingAvailable}
            />
            <Checkbox name="featured" label="Feature this listing" defaultChecked={location.featured} />
          </div>
          <Field label="Description" className="sm:col-span-2">
            <Textarea name="description" rows={3} defaultValue={location.description ?? ""} />
          </Field>
          <div className="sm:col-span-2">
            <PropertyMedia photos={location.photos} video={location.video} />
          </div>
          <PropertyMediaFields organizationId={location.organizationId} />
        </ActionForm>

        <div className="mt-6 border-t border-[var(--border)] pt-6">
          <ActionForm
            action={deleteProperty}
            submitLabel="Delete location"
            pendingLabel="Deleting…"
            successMessage="Deleted."
            hiddenFields={{ id: location.id }}
            variant="secondary"
            size="sm"
          />
        </div>
      </Panel>
    </div>
  );
}
