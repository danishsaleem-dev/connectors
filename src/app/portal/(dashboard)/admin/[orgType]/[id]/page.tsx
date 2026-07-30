import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db/client";
import { getProfile } from "@/lib/db/queries";
import { documents, messages, organizations, properties, requests, users } from "@/lib/db/schema";
import { ActionForm } from "@/components/portal/ActionForm";
import { MessageThread } from "@/components/portal/MessageThread";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { ProfileFields } from "@/components/portal/ProfileFields";
import { EmptyState, ListRow, Panel, Pill } from "@/components/portal/ui";
import { Field, Input, Select } from "@/components/ui";
import { createDocument, postMessage, updateOrganization } from "@/lib/portal/actions";
import {
  PROPERTY_STATUS_LABEL,
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

  const [profile, orgUsers, orgProperties, orgRequests, orgDocs, orgMessages] = await Promise.all([
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
  ]);

  return (
    <div>
      <PortalHeader
        title={org.name}
        subtitle={`${meta.singular} · joined ${org.createdAt.toLocaleDateString()}`}
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
          <ProfileFields type={org.type} profile={profile} />
        </ActionForm>
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Accounts">
          {orgUsers.length === 0 ? (
            <EmptyState>No portal accounts yet.</EmptyState>
          ) : (
            <div className="space-y-2">
              {orgUsers.map((u) => (
                <ListRow key={u.id} title={u.name} meta={u.email} />
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
                      <Pill tone="neutral">
                        {PROPERTY_STATUS_LABEL[property.status] ?? property.status}
                      </Pill>
                    }
                  />
                ))}
              </div>
            )}
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

      <Panel title="Documents" className="mt-6">
        <div className="space-y-2">
          {orgDocs.length === 0 ? (
            <EmptyState>No documents shared.</EmptyState>
          ) : (
            orgDocs.map((doc) => (
              <ListRow
                key={doc.id}
                title={
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-600 underline underline-offset-4"
                  >
                    {doc.title}
                  </a>
                }
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
            <Field label="Link" className="sm:col-span-2">
              <Input name="url" type="url" required placeholder="https://…" />
            </Field>
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
