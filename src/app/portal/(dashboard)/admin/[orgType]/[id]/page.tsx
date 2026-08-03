import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db/client";
import { getProfile } from "@/lib/db/queries";
import {
  documents,
  franchiseOpportunities,
  messages,
  organizations,
  properties,
  requests,
  users,
} from "@/lib/db/schema";
import { ActionForm } from "@/components/portal/ActionForm";
import { AddressPicker } from "@/components/portal/AddressPicker";
import { DocumentUpload } from "@/components/portal/DocumentUpload";
import { MessageThread } from "@/components/portal/MessageThread";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { DocumentLink } from "@/components/portal/PropertyMedia";
import { ProfileFields } from "@/components/portal/ProfileFields";
import { PropertyMediaFields } from "@/components/portal/PropertyMediaFields";
import { ResetPasswordButton } from "@/components/portal/ResetPasswordButton";
import { EmptyState, ListRow, Panel, Pill, formatRange } from "@/components/portal/ui";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui";
import { resolveMediaUrl } from "@/lib/storage/media";
import {
  createDocument,
  deleteFranchiseOpportunity,
  deleteProperty,
  postMessage,
  saveFranchiseOpportunity,
  saveProperty,
  updateOrganization,
} from "@/lib/portal/actions";
import {
  FRANCHISE_STATUS_LABEL,
  PROPERTY_STATUS_LABEL,
  PROPERTY_TYPE_LABEL,
  REQUEST_STATUS_LABEL,
  REQUEST_TYPE_LABEL,
  orgTypeBySlug,
} from "@/lib/portal/domain";

export const metadata: Metadata = {
  title: "Organization",
  robots: { index: false, follow: false },
};

export default async function AdminOrgDetailPage({
  params,
}: {
  params: Promise<{ orgType: string; id: string }>;
}) {
  await requireAdmin();
  const { orgType, id } = await params;
  const meta = orgTypeBySlug(orgType);
  if (!meta) notFound();

  const db = getDb();
  const [org] = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
  // Guard the type too, so /admin/brands/<a-landlord-id> 404s rather than
  // rendering the wrong profile form.
  if (!org || org.type !== meta.type) notFound();

  const [profile, orgUsers, orgProperties, orgRequests, orgDocs, orgMessages, orgFranchises] =
    await Promise.all([
    getProfile(org.type, org.id),
    db.select().from(users).where(eq(users.organizationId, org.id)),
    db.select().from(properties).where(eq(properties.organizationId, org.id)),
    db
      .select()
      .from(requests)
      .where(eq(requests.organizationId, org.id))
      .orderBy(desc(requests.createdAt)),
    db.select().from(documents).where(eq(documents.organizationId, org.id)),
    db
      .select()
      .from(messages)
      .where(eq(messages.organizationId, org.id))
      .orderBy(asc(messages.createdAt)),
    org.type === "brand"
      ? db
          .select()
          .from(franchiseOpportunities)
          .where(eq(franchiseOpportunities.organizationId, org.id))
          .orderBy(desc(franchiseOpportunities.createdAt))
      : Promise.resolve([]),
  ]);

  const logoPath =
    org.type === "brand" && typeof profile?.logoUrl === "string" ? profile.logoUrl : null;
  const logoUrl = await resolveMediaUrl(logoPath);

  return (
    <div>
      <PortalHeader
        title={org.name}
        subtitle={`${meta.singular} · joined ${org.createdAt.toLocaleDateString()}`}
        action={
          logoUrl && (
            // A private, signed Storage URL — not something next/image's
            // remote-pattern allowlist can know about ahead of time.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={`${org.name} logo`}
              className="h-14 w-14 shrink-0 rounded-xl border border-[var(--border)] object-cover"
            />
          )
        }
      />

      <Panel title="Details">
        <ActionForm
          action={updateOrganization}
          submitLabel="Save changes"
          hiddenFields={{ id: org.id }}
        >
          <Field label="Organization name">
            <Input name="name" defaultValue={org.name} required />
          </Field>
          <Field label="Status">
            <Select name="status" defaultValue={org.status}>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </Select>
          </Field>
          <Field label="Phone">
            <Input name="phone" defaultValue={org.phone ?? ""} />
          </Field>
          <Field label="Country">
            <Input name="country" defaultValue={org.country ?? ""} />
          </Field>
          <ProfileFields
            type={org.type}
            profile={profile}
            organizationId={org.id}
            logoPreview={logoPath ? { path: logoPath, url: logoUrl } : null}
          />
        </ActionForm>
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Accounts">
          {orgUsers.length === 0 ? (
            <EmptyState>No portal accounts yet.</EmptyState>
          ) : (
            <div className="space-y-2">
              {orgUsers.map((u) => (
                <ListRow
                  key={u.id}
                  title={u.name}
                  meta={u.email}
                  trailing={<ResetPasswordButton userId={u.id} />}
                />
              ))}
            </div>
          )}
        </Panel>

        {meta.listsProperties && (
          <Panel title="Properties">
            {orgProperties.length === 0 ? (
              <EmptyState>No space listed yet.</EmptyState>
            ) : (
              <div className="space-y-2">
                {orgProperties.map((property) => (
                  <ListRow
                    key={property.id}
                    title={property.title}
                    meta={`${property.city}${property.sizeSqft ? ` · ${property.sizeSqft} sq ft` : ""}`}
                    trailing={
                      <div className="flex items-center gap-3">
                        <Pill tone="neutral">
                          {PROPERTY_STATUS_LABEL[property.status] ?? property.status}
                        </Pill>
                        <ActionForm
                          action={deleteProperty}
                          submitLabel="Remove"
                          pendingLabel="…"
                          successMessage="Removed."
                          hiddenFields={{ id: property.id }}
                          size="sm"
                          variant="secondary"
                          className="sm:grid-cols-1"
                        />
                      </div>
                    }
                  />
                ))}
              </div>
            )}
            <div className="mt-5 border-t border-[var(--border)] pt-5">
              <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
                Add a property on their behalf
              </p>
              <ActionForm
                action={saveProperty}
                submitLabel="Add property"
                pendingLabel="Adding…"
                successMessage="Property added."
                hiddenFields={{ organizationId: org.id }}
                size="sm"
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
                <Field label="Dimensions" hint="e.g. 40ft x 60ft">
                  <Input name="dimensions" />
                </Field>
                <div className="flex items-end pb-2 sm:col-span-2">
                  <Checkbox name="parkingAvailable" label="Parking available" />
                </div>
                <Field label="Description" className="sm:col-span-2">
                  <Textarea name="description" rows={3} />
                </Field>
                <PropertyMediaFields organizationId={org.id} />
              </ActionForm>
            </div>
          </Panel>
        )}

        {meta.requestTypes.length > 0 && (
          <Panel title="Requests">
            {orgRequests.length === 0 ? (
              <EmptyState>No requests submitted.</EmptyState>
            ) : (
              <div className="space-y-2">
                {orgRequests.map((request) => (
                  <ListRow
                    key={request.id}
                    href="/portal/admin/requests"
                    title={request.title}
                    meta={REQUEST_TYPE_LABEL[request.type]}
                    trailing={
                      <Pill tone="neutral">
                        {REQUEST_STATUS_LABEL[request.status] ?? request.status}
                      </Pill>
                    }
                  />
                ))}
              </div>
            )}
          </Panel>
        )}
      </div>

      {org.type === "brand" && (
        <Panel title="Franchise opportunities" className="mt-6">
          {orgFranchises.length === 0 ? (
            <EmptyState>No franchise opportunities listed for this brand yet.</EmptyState>
          ) : (
            <div className="space-y-2">
              {orgFranchises.map((opportunity) => {
                const investment = formatRange(
                  opportunity.investmentMin,
                  opportunity.investmentMax,
                  opportunity.currency,
                );
                return (
                  <ListRow
                    key={opportunity.id}
                    title={opportunity.title}
                    meta={[
                      [opportunity.city, opportunity.country].filter(Boolean).join(", "),
                      opportunity.territory,
                      investment,
                      opportunity.spaceRequiredSqft
                        ? `${opportunity.spaceRequiredSqft.toLocaleString()} sq ft`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                    trailing={
                      <div className="flex items-center gap-2">
                        <Pill tone={opportunity.status === "available" ? "green" : "neutral"}>
                          {FRANCHISE_STATUS_LABEL[opportunity.status] ?? opportunity.status}
                        </Pill>
                        <ActionForm
                          action={deleteFranchiseOpportunity}
                          submitLabel="Remove"
                          pendingLabel="…"
                          successMessage="Removed."
                          hiddenFields={{ id: opportunity.id }}
                          size="sm"
                          variant="secondary"
                          layout="inline"
                        />
                      </div>
                    }
                  />
                );
              })}
            </div>
          )}

          <div className="mt-5 border-t border-[var(--border)] pt-5">
            <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
              Add a franchise opportunity
            </p>
            <ActionForm
              action={saveFranchiseOpportunity}
              submitLabel="Add opportunity"
              pendingLabel="Adding…"
              successMessage="Opportunity added."
              hiddenFields={{ organizationId: org.id }}
              size="sm"
            >
              <Field label="Title" className="sm:col-span-2">
                <Input name="title" required placeholder="e.g. Central London flagship" />
              </Field>
              <Field label="City">
                <Input name="city" required />
              </Field>
              <Field label="Country">
                <Input name="country" />
              </Field>
              <Field label="Territory" hint="Optional — exclusivity area">
                <Input name="territory" placeholder="e.g. Greater London" />
              </Field>
              <Field label="Status">
                <Select name="status" defaultValue="available">
                  {Object.entries(FRANCHISE_STATUS_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Investment from">
                <Input name="investmentMin" type="number" />
              </Field>
              <Field label="Investment to">
                <Input name="investmentMax" type="number" />
              </Field>
              <Field label="Space required (sq ft)">
                <Input name="spaceRequiredSqft" type="number" />
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <Textarea name="description" rows={3} />
              </Field>
            </ActionForm>
          </div>
        </Panel>
      )}

      <Panel title="Documents" className="mt-6">
        <div className="space-y-2">
          {orgDocs.length === 0 ? (
            <EmptyState>No documents shared.</EmptyState>
          ) : (
            orgDocs.map((doc) => (
              <ListRow
                key={doc.id}
                title={<DocumentLink url={doc.url}>{doc.title}</DocumentLink>}
                trailing={<Pill tone="neutral">{doc.kind}</Pill>}
              />
            ))
          )}
        </div>
        <div className="mt-5 border-t border-[var(--border)] pt-5">
          <ActionForm
            action={createDocument}
            submitLabel="Add document"
            pendingLabel="Adding…"
            successMessage="Document added."
            hiddenFields={{ organizationId: org.id }}
            size="sm"
          >
            <Field label="Title">
              <Input name="title" required />
            </Field>
            <Field label="Kind">
              <Select name="kind" defaultValue="document">
                <option value="document">Document</option>
                <option value="agreement">Agreement</option>
              </Select>
            </Field>
            <DocumentUpload organizationId={org.id} />
          </ActionForm>
        </div>
      </Panel>

      <Panel title="Messages" className="mt-6">
        <MessageThread
          messages={orgMessages}
          action={postMessage}
          hiddenFields={{ organizationId: org.id }}
        />
      </Panel>
    </div>
  );
}
