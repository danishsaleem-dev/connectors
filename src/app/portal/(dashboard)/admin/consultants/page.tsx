import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/current-user";
import { listAllConsultants } from "@/lib/db/queries";
import { ActionForm } from "@/components/portal/ActionForm";
import { ListToolbar, matchesQuery } from "@/components/portal/ListToolbar";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { EmptyState, Pill, RecordList, RecordRow, TagRun } from "@/components/portal/ui";
import { ButtonLink, Select } from "@/components/ui";
import { setConsultantPublished } from "@/lib/portal/actions";
import { consultantHref } from "@/lib/portal/admin-href";

export const metadata: Metadata = {
  title: "Consultants",
  robots: { index: false, follow: false },
};

const STATUS_OPTIONS = [
  { value: "true", label: "Published" },
  { value: "false", label: "Draft" },
];

/** Initials for the roster avatar — a photo isn't guaranteed, and a
 * consistent circle keeps the rows aligned whether or not there is one. */
function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

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
      matchesQuery(q, c.name, ...(c.expertise ?? []).map((e) => e.name)) &&
      (!status || String(c.isPublished) === status),
  );

  const published = allRows.filter((c) => c.isPublished).length;

  return (
    <div>
      <PortalHeader
        title="Consultants"
        subtitle={`${allRows.length} ${allRows.length === 1 ? "record" : "records"} · ${published} published`}
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

      {allRows.length === 0 ? (
        <EmptyState>No consultants yet.</EmptyState>
      ) : rows.length === 0 ? (
        <EmptyState>No consultants match that search.</EmptyState>
      ) : (
        <RecordList>
          {rows.map((c) => (
            <RecordRow
              key={c.id}
              href={consultantHref(c)}
              title={c.name}
              subtitle={c.title ?? undefined}
              leading={
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-violet-50 text-xs font-semibold text-violet-600">
                  {initials(c.name)}
                </span>
              }
              facts={[
                {
                  label: "Expertise",
                  value:
                    c.expertise && c.expertise.length > 0 ? (
                      <TagRun items={c.expertise.map((e) => e.name)} max={2} />
                    ) : null,
                },
                {
                  label: "Experience",
                  value: c.yearsExperience != null ? `${c.yearsExperience} yrs` : null,
                },
              ]}
              status={
                <Pill tone={c.isPublished ? "green" : "amber"}>
                  {c.isPublished ? "Published" : "Draft"}
                </Pill>
              }
              actions={
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
              }
            />
          ))}
        </RecordList>
      )}
    </div>
  );
}
