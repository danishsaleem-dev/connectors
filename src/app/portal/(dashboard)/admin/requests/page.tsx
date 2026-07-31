import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db/client";
import { organizations, requests } from "@/lib/db/schema";
import { ActionForm } from "@/components/portal/ActionForm";
import { ListToolbar, matchesQuery } from "@/components/portal/ListToolbar";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { EmptyState, Panel, Pill, formatRange } from "@/components/portal/ui";
import { Select } from "@/components/ui";
import { setRequestStatus } from "@/lib/portal/actions";
import { REQUEST_TYPE_LABEL, REQUEST_STATUS_LABEL, orgTypeMeta } from "@/lib/portal/domain";

export const metadata: Metadata = {
  title: "Requests",
  robots: { index: false, follow: false },
};

const STATUS_OPTIONS = Object.entries(REQUEST_STATUS_LABEL).map(([value, label]) => ({
  value,
  label,
}));

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireAdmin();
  const { q, status } = await searchParams;

  const allRows = await getDb()
    .select({
      id: requests.id,
      type: requests.type,
      title: requests.title,
      cities: requests.cities,
      industries: requests.industries,
      budgetMin: requests.budgetMin,
      budgetMax: requests.budgetMax,
      currency: requests.currency,
      sizeSqft: requests.sizeSqft,
      notes: requests.notes,
      status: requests.status,
      createdAt: requests.createdAt,
      organizationId: requests.organizationId,
      organizationName: organizations.name,
      organizationType: organizations.type,
    })
    .from(requests)
    .innerJoin(organizations, eq(requests.organizationId, organizations.id))
    .orderBy(desc(requests.createdAt));

  const rows = allRows.filter(
    (request) =>
      matchesQuery(q, request.title, request.organizationName, ...(request.cities ?? [])) &&
      (!status || request.status === status),
  );

  return (
    <div>
      <PortalHeader
        title="Requests"
        subtitle="What franchisees and investors are looking for. Follow up directly using their contact details."
      />

      <ListToolbar
        action="/portal/admin/requests"
        placeholder="Search by title, organization or city…"
        query={q}
        statusOptions={STATUS_OPTIONS}
        statusValue={status}
      />

      {allRows.length === 0 ? (
        <EmptyState>No requests submitted yet.</EmptyState>
      ) : rows.length === 0 ? (
        <EmptyState>No requests match that search.</EmptyState>
      ) : (
        <div className="space-y-4">
          {rows.map((request) => {
            const budget = formatRange(request.budgetMin, request.budgetMax, request.currency);
            const meta = orgTypeMeta(request.organizationType);
            return (
              <Panel key={request.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{request.title}</p>
                      <Pill tone="amber">{REQUEST_TYPE_LABEL[request.type]}</Pill>
                      <Pill tone="neutral">
                        {REQUEST_STATUS_LABEL[request.status] ?? request.status}
                      </Pill>
                    </div>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      <a
                        href={`/portal/admin/${meta.slug}/${request.organizationId}`}
                        className="text-violet-600 underline underline-offset-4"
                      >
                        {request.organizationName}
                      </a>{" "}
                      · {meta.singular} · {request.createdAt.toLocaleDateString()}
                    </p>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {[
                        request.cities?.length ? request.cities.join(", ") : null,
                        request.industries?.length ? request.industries.join(", ") : null,
                        budget,
                        request.sizeSqft ? `${request.sizeSqft.toLocaleString()} sq ft` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {request.notes && (
                      <p className="mt-2 whitespace-pre-wrap text-sm">{request.notes}</p>
                    )}
                  </div>

                  <ActionForm
                    action={setRequestStatus}
                    submitLabel="Update"
                    pendingLabel="…"
                    successMessage="Updated."
                    hiddenFields={{ id: request.id }}
                    size="sm"
                    variant="secondary"
                    layout="inline"
                  >
                    <span className="w-36 shrink-0">
                      <Select name="status" defaultValue={request.status}>
                        <option value="open">Open</option>
                        <option value="in_review">In review</option>
                        <option value="matched">Matched</option>
                        <option value="closed">Closed</option>
                      </Select>
                    </span>
                  </ActionForm>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}
