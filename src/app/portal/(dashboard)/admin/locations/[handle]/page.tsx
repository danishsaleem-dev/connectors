import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, or } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db/client";
import { properties } from "@/lib/db/schema";
import { listInterestCandidateOrgs, listPropertyInterests, listPropertyOwners } from "@/lib/db/queries";
import { ActionForm } from "@/components/portal/ActionForm";
import { AddressPicker } from "@/components/portal/AddressPicker";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PropertyMediaFields } from "@/components/portal/PropertyMediaFields";
import { Panel, Pill } from "@/components/portal/ui";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui";
import {
  createPropertyInterest,
  deleteProperty,
  deletePropertyInterest,
  saveProperty,
} from "@/lib/portal/actions";
import { PROPERTY_STATUS_LABEL, PROPERTY_TYPE_LABEL } from "@/lib/portal/domain";
import { isUuid } from "@/lib/portal/admin-href";
import { resolveMediaUrl } from "@/lib/storage/media";

const ORG_TYPE_LABEL: Record<string, string> = {
  brand: "Brand",
  franchisee: "Franchisee",
  investor: "Investor",
};

export const metadata: Metadata = {
  title: "Edit location",
  robots: { index: false, follow: false },
};

export default async function AdminLocationDetailPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  await requireAdmin();
  const { handle } = await params;

  // Slug first — see admin-href's isUuid for why the uuid branch is
  // conditional rather than always part of the OR.
  const [location] = await getDb()
    .select()
    .from(properties)
    .where(
      isUuid(handle)
        ? or(eq(properties.slug, handle), eq(properties.id, handle))
        : eq(properties.slug, handle),
    )
    .limit(1);
  if (!location) notFound();

  const [owners, initialPhotos, initialVideoUrl, interestCandidates, interests] = await Promise.all([
    listPropertyOwners(),
    Promise.all(
      (location.photos ?? []).map(async (path) => ({ path, previewUrl: await resolveMediaUrl(path) })),
    ),
    resolveMediaUrl(location.video),
    listInterestCandidateOrgs(),
    listPropertyInterests(location.id),
  ]);
  const flaggedOrgIds = new Set(interests.map((i) => i.organizationId));
  const availableCandidates = interestCandidates.filter((o) => !flaggedOrgIds.has(o.id));
  const initialVideo = location.video ? { path: location.video, previewUrl: initialVideoUrl } : null;

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
          <PropertyMediaFields
            organizationId={location.organizationId}
            initialPhotos={initialPhotos}
            initialVideo={initialVideo}
          />
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

      <Panel
        title="Interested organizations"
        className="mt-5"
        action={<Pill>{interests.length}</Pill>}
      >
        <p className="mb-4 text-xs text-[var(--muted)]">
          Shown to the property&apos;s owner in the app — name and type only, never contact
          details. Following up still goes through Connectors, the same as every other
          introduction.
        </p>

        {interests.length > 0 && (
          <div className="mb-5 space-y-2">
            {interests.map((interest) => (
              <div
                key={interest.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-[var(--border)] p-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{interest.organizationName}</span>
                    <Pill tone="violet">
                      {ORG_TYPE_LABEL[interest.organizationType] ?? interest.organizationType}
                    </Pill>
                  </div>
                  {interest.note && (
                    <p className="mt-1 text-xs text-[var(--muted)]">{interest.note}</p>
                  )}
                </div>
                <ActionForm
                  action={deletePropertyInterest}
                  submitLabel="Remove"
                  pendingLabel="Removing…"
                  hiddenFields={{ id: interest.id }}
                  variant="secondary"
                  size="sm"
                  layout="inline"
                />
              </div>
            ))}
          </div>
        )}

        {availableCandidates.length > 0 ? (
          <ActionForm
            action={createPropertyInterest}
            submitLabel="Flag as interested"
            pendingLabel="Saving…"
            successMessage="Flagged."
            hiddenFields={{ propertyId: location.id }}
          >
            <Field label="Organization" className="sm:col-span-2">
              <Select name="organizationId" required defaultValue="">
                <option value="" disabled>
                  Choose an organization…
                </option>
                {availableCandidates.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} — {ORG_TYPE_LABEL[o.type] ?? o.type}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Note" hint="Optional — shown to the landlord/developer" className="sm:col-span-2">
              <Input name="note" placeholder="e.g. Looking for a flagship unit in this district" />
            </Field>
          </ActionForm>
        ) : (
          <p className="text-xs text-[var(--muted)]">
            Every brand/franchisee/investor org is already flagged on this property.
          </p>
        )}
      </Panel>
    </div>
  );
}
