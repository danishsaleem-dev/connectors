import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/current-user";
import { listAllConsultants } from "@/lib/db/queries";
import { ActionForm } from "@/components/portal/ActionForm";
import { ListToolbar, matchesQuery } from "@/components/portal/ListToolbar";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { EmptyState, ListRow, Pill } from "@/components/portal/ui";
import { ButtonLink, Select } from "@/components/ui";
import { setConsultantPublished } from "@/lib/portal/actions";

export const metadata: Metadata = {
  title: "Consultants",
  robots: { index: false, follow: false },
};

const STATUS_OPTIONS = [
  { value: "true", label: "Published" },
  { value: "false", label: "Draft" },
];

export default async function AdminConsultantsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireAdmin();
  const { q, status } = await searchParams;

  const allRows = await listAllConsultants();
  const rows = allRows.filter(
    (c) =>
      matchesQuery(q, c.name, ...(c.expertise ?? [])) &&
      (!status || String(c.isPublished) === status),
  );

  return (
    <div>
      <PortalHeader
        title="Consultants"
        subtitle={`${allRows.length} ${allRows.length === 1 ? "record" : "records"}`}
        action={
          <ButtonLink href="/portal/admin/consultants/new" size="sm">
            Add consultant
          </ButtonLink>
        }
      />

      <ListToolbar
        action="/portal/admin/consultants"
        placeholder="Search by name or expertise…"
        query={q}
        statusOptions={STATUS_OPTIONS}
        statusValue={status}
      />

      <div className="space-y-2">
        {allRows.length === 0 ? (
          <EmptyState>No consultants yet.</EmptyState>
        ) : rows.length === 0 ? (
          <EmptyState>No consultants match that search.</EmptyState>
        ) : (
          rows.map((c) => (
            <ListRow
              key={c.id}
              title={
                <Link href={`/portal/admin/consultants/${c.id}`} className="hover:text-violet-600">
                  {c.name}
                </Link>
              }
              meta={
                [
                  c.expertise && c.expertise.length > 0 ? c.expertise.join(" · ") : null,
                  c.yearsExperience != null ? `${c.yearsExperience} yrs experience` : null,
                ]
                  .filter(Boolean)
                  .join(" — ") || undefined
              }
              trailing={
                <div className="flex items-center gap-2">
                  <Pill tone={c.isPublished ? "green" : "amber"}>
                    {c.isPublished ? "Published" : "Draft"}
                  </Pill>
                  <ActionForm
                    action={setConsultantPublished}
                    submitLabel="Update"
                    pendingLabel="…"
                    successMessage="Updated."
                    hiddenFields={{ id: c.id }}
                    size="sm"
                    variant="secondary"
                    layout="inline"
                  >
                    <span className="w-28 shrink-0">
                      <Select name="isPublished" defaultValue={String(c.isPublished)}>
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
          ))
        )}
      </div>
    </div>
  );
}
