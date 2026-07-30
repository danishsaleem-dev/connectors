import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { requireParticipant } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db/client";
import { requests } from "@/lib/db/schema";
import { ActionForm } from "@/components/portal/ActionForm";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { EmptyState, ListRow, Panel, Pill, formatRange } from "@/components/portal/ui";
import { Field, Input, Select, Textarea } from "@/components/ui";
import { createRequest } from "@/lib/portal/actions";
import { REQUEST_STATUS_LABEL, REQUEST_TYPE_LABEL, orgTypeMeta } from "@/lib/portal/domain";

export const metadata: Metadata = {
  title: "My requests",
  robots: { index: false, follow: false },
};

const HELP: Record<string, string> = {
  franchisee:
    "Tell us what kind of franchise you're looking for. Our team will follow up directly.",
  investor: "Tell us what you're looking to back. Our team will follow up directly.",
};

export default async function ParticipantRequestsPage() {
  const { organization } = await requireParticipant();
  const meta = orgTypeMeta(organization.type);
  // Only franchisees and investors submit requests.
  if (meta.requestTypes.length === 0) redirect("/portal");

  const rows = await getDb()
    .select()
    .from(requests)
    .where(eq(requests.organizationId, organization.id))
    .orderBy(desc(requests.createdAt));

  return (
    <div>
      <PortalHeader title="My requests" subtitle={HELP[organization.type]} />

      <Panel title="Submit a request">
        <ActionForm
          action={createRequest}
          submitLabel="Submit request"
          pendingLabel="Submitting…"
          successMessage="Submitted — our team will follow up directly."
        >
          <Field label="What are you looking for?" className="sm:col-span-2">
            <Input
              name="title"
              required
              placeholder="e.g. Two units in central London, 1,500–2,500 sq ft"
            />
          </Field>
          <Field label="Type">
            <Select name="type" required defaultValue={meta.requestTypes[0]}>
              {meta.requestTypes.map((type) => (
                <option key={type} value={type}>
                  {REQUEST_TYPE_LABEL[type]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Size needed (sq ft)" hint="Optional">
            <Input name="sizeSqft" type="number" />
          </Field>
          <Field label="Budget from">
            <Input name="budgetMin" type="number" />
          </Field>
          <Field label="Budget to">
            <Input name="budgetMax" type="number" />
          </Field>
          <Field label="Cities" hint="Comma separated" className="sm:col-span-2">
            <Input name="cities" placeholder="London, Manchester" />
          </Field>
          <Field label="Industries" hint="Comma separated" className="sm:col-span-2">
            <Input name="industries" placeholder="Food & Beverage" />
          </Field>
          <Field label="Anything else" className="sm:col-span-2">
            <Textarea name="notes" rows={3} />
          </Field>
        </ActionForm>
      </Panel>

      <div className="mt-8 space-y-2">
        {rows.length === 0 ? (
          <EmptyState>No requests yet.</EmptyState>
        ) : (
          rows.map((request) => (
            <ListRow
              key={request.id}
              title={request.title}
              meta={[
                REQUEST_TYPE_LABEL[request.type],
                request.cities?.length ? request.cities.join(", ") : null,
                formatRange(request.budgetMin, request.budgetMax, request.currency),
              ]
                .filter(Boolean)
                .join(" · ")}
              trailing={
                <Pill tone={request.status === "matched" ? "green" : "neutral"}>
                  {REQUEST_STATUS_LABEL[request.status] ?? request.status}
                </Pill>
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
