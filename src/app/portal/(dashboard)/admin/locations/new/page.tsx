import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/current-user";
import { listPropertyOwners } from "@/lib/db/queries";
import { ActionForm } from "@/components/portal/ActionForm";
import { AddressPicker } from "@/components/portal/AddressPicker";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PropertyMediaFields } from "@/components/portal/PropertyMediaFields";
import { Panel } from "@/components/portal/ui";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui";
import { saveProperty } from "@/lib/portal/actions";
import { PROPERTY_STATUS_LABEL, PROPERTY_TYPE_LABEL } from "@/lib/portal/domain";

export const metadata: Metadata = {
  title: "Add location",
  robots: { index: false, follow: false },
};

export default async function AdminLocationNewPage() {
  await requireAdmin();
  const owners = await listPropertyOwners();

  return (
    <div>
      <PortalHeader
        title="Add location"
        subtitle={
          <Link href="/portal/admin/locations" className="hover:text-violet-600">
            ← Back to locations
          </Link>
        }
      />

      <Panel>
        <ActionForm
          action={saveProperty}
          submitLabel="Add location"
          pendingLabel="Adding…"
          successMessage="Location added — find it in the list, or add another below."
        >
          <Field label="Landlord / Agent" className="sm:col-span-2">
            <Select name="organizationId" required defaultValue="">
              <option value="" disabled>
                Select an owner…
              </option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </Select>
          </Field>
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
          <Field label="Dimensions" hint="e.g. 40ft x 60ft">
            <Input name="dimensions" />
          </Field>
          <div className="flex items-end pb-2 sm:col-span-2">
            <Checkbox name="parkingAvailable" label="Parking available" />
          </div>
          <Field label="Description" className="sm:col-span-2">
            <Textarea name="description" rows={3} />
          </Field>
          <PropertyMediaFields organizationId="pending-location" />
        </ActionForm>
      </Panel>
    </div>
  );
}
