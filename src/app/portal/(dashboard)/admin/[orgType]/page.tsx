import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db/client";
import { organizations } from "@/lib/db/schema";
import { ActionForm } from "@/components/portal/ActionForm";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { EmptyState, ListRow, Panel, Pill } from "@/components/portal/ui";
import { Field, Input } from "@/components/ui";
import { createOrganization } from "@/lib/portal/actions";
import { orgTypeBySlug } from "@/lib/portal/domain";

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
}: {
  params: Promise<{ orgType: string }>;
}) {
  await requireAdmin();
  const { orgType } = await params;
  const meta = orgTypeBySlug(orgType);
  if (!meta) notFound();

  const rows = await getDb()
    .select()
    .from(organizations)
    .where(eq(organizations.type, meta.type))
    .orderBy(desc(organizations.createdAt));

  return (
    <div>
      <PortalHeader
        title={meta.plural}
        subtitle={`${rows.length} ${rows.length === 1 ? "record" : "records"}`}
      />

      <Panel title={`Add ${meta.singular.toLowerCase()}`}>
        <ActionForm
          action={createOrganization}
          submitLabel={`Add ${meta.singular.toLowerCase()}`}
          pendingLabel="Adding…"
          successMessage={`${meta.singular} added.`}
          hiddenFields={{ type: meta.type }}
        >
          <Field label="Organization name" className="sm:col-span-2">
            <Input name="name" required placeholder={`e.g. Northside Coffee Co.`} />
          </Field>
        </ActionForm>
      </Panel>

      <div className="mt-8 space-y-2">
        {rows.length === 0 ? (
          <EmptyState>No {meta.plural.toLowerCase()} yet.</EmptyState>
        ) : (
          rows.map((org) => (
            <ListRow
              key={org.id}
              href={`/portal/admin/${meta.slug}/${org.id}`}
              title={org.name}
              meta={[org.country, org.phone].filter(Boolean).join(" · ") || undefined}
              trailing={
                <div className="flex items-center gap-2">
                  <Pill tone={org.onboardingCompletedAt ? "green" : "amber"}>
                    {org.onboardingCompletedAt ? "Onboarded" : "Pending"}
                  </Pill>
                  <Pill tone="neutral">{org.status}</Pill>
                </div>
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
