import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db/client";
import { organizations } from "@/lib/db/schema";
import { ActionForm } from "@/components/portal/ActionForm";
import { ListToolbar, matchesQuery } from "@/components/portal/ListToolbar";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { EmptyState, ListRow, Pill } from "@/components/portal/ui";
import { ButtonLink, Select } from "@/components/ui";
import { updateOrganization } from "@/lib/portal/actions";
import { orgTypeBySlug } from "@/lib/portal/domain";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

/**
 * One route serves all five participant modules — /portal/admin/brands,
 * /franchisees, /landlords, /developers, /investors. They're genuinely the
 * same page with different labels and a different filter, so this stays a
 * single file rather than five near-identical ones.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orgType: string }>;
}): Promise<Metadata> {
  const { orgType } = await params;
  const meta = orgTypeBySlug(orgType);
  return {
    title: meta ? meta.plural : "Not found",
    robots: { index: false, follow: false },
  };
}

export default async function AdminOrgTypeListPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgType: string }>;
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireAdmin();
  const { orgType } = await params;
  const { q, status } = await searchParams;
  const meta = orgTypeBySlug(orgType);
  if (!meta) notFound();

  const allRows = await getDb()
    .select()
    .from(organizations)
    .where(eq(organizations.type, meta.type))
    .orderBy(desc(organizations.createdAt));

  const rows = allRows.filter(
    (org) =>
      matchesQuery(q, org.name, org.country, org.phone) && (!status || org.status === status),
  );

  return (
    <div>
      <PortalHeader
        title={meta.plural}
        subtitle={`${allRows.length} ${allRows.length === 1 ? "record" : "records"}`}
        action={
          <ButtonLink href={`/portal/admin/${meta.slug}/new`} size="sm">
            Add {meta.singular.toLowerCase()}
          </ButtonLink>
        }
      />

      <ListToolbar
        action={`/portal/admin/${meta.slug}`}
        placeholder="Search by name, country or phone…"
        query={q}
        statusOptions={STATUS_OPTIONS}
        statusValue={status}
      />

      <div className="space-y-2">
        {allRows.length === 0 ? (
          <EmptyState>No {meta.plural.toLowerCase()} yet.</EmptyState>
        ) : rows.length === 0 ? (
          <EmptyState>No {meta.plural.toLowerCase()} match that search.</EmptyState>
        ) : (
          rows.map((org) => (
            <ListRow
              key={org.id}
              // Not passed as `href` — trailing holds a <form>, and nesting
              // a form inside the <a> that href wraps the row in is invalid
              // HTML. The org name is the click target instead.
              title={
                <Link
                  href={`/portal/admin/${meta.slug}/${org.id}`}
                  className="hover:text-violet-600"
                >
                  {org.name}
                </Link>
              }
              meta={[org.country, org.phone].filter(Boolean).join(" · ") || undefined}
              trailing={
                <div className="flex items-center gap-2">
                  <Pill tone={org.onboardingCompletedAt ? "green" : "amber"}>
                    {org.onboardingCompletedAt ? "Onboarded" : "Pending"}
                  </Pill>
                  {/* Quick status change, right from the list — the full
                      profile edit still lives on the detail page. */}
                  <ActionForm
                    action={updateOrganization}
                    submitLabel="Update"
                    pendingLabel="…"
                    successMessage="Updated."
                    hiddenFields={{ id: org.id }}
                    size="sm"
                    variant="secondary"
                    layout="inline"
                  >
                    {/* Select's shared style hardcodes w-full — that conflicts
                        with a width class passed directly to it the same way
                        the grid-cols override did, so the width lives on this
                        wrapper instead. */}
                    <span className="w-32 shrink-0">
                      <Select name="status" defaultValue={org.status}>
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
