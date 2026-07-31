import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db/client";
import { documents, organizations } from "@/lib/db/schema";
import { ActionForm } from "@/components/portal/ActionForm";
import { ListToolbar, matchesQuery } from "@/components/portal/ListToolbar";
import { MediaThumb } from "@/components/portal/MediaThumb";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { DocumentLink } from "@/components/portal/PropertyMedia";
import { EmptyState, ListRow, Pill } from "@/components/portal/ui";
import { Input } from "@/components/ui";
import { deleteDocument, renameDocument } from "@/lib/portal/actions";
import { orgTypeMeta } from "@/lib/portal/domain";

/**
 * Every file shared with an organization, across every module, in one place
 * — the WordPress-style "media library" ask. Deliberately scoped to
 * `documents` only: property photos/video live as a plain path array on the
 * property row with no independent identity (no per-photo title, no id to
 * rename or delete against), so they're managed from the property's own edit
 * form, not here. A brand's logo is a single field for the same reason.
 * Broadening that would mean giving photos real rows of their own — a
 * bigger, separate change, not bundled into this one.
 */

export const metadata: Metadata = {
  title: "Media",
  robots: { index: false, follow: false },
};

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const { q } = await searchParams;

  const allRows = await getDb()
    .select({
      id: documents.id,
      title: documents.title,
      url: documents.url,
      kind: documents.kind,
      createdAt: documents.createdAt,
      organizationId: documents.organizationId,
      organizationName: organizations.name,
      organizationType: organizations.type,
    })
    .from(documents)
    .innerJoin(organizations, eq(documents.organizationId, organizations.id))
    .orderBy(desc(documents.createdAt));

  const rows = allRows.filter((doc) => matchesQuery(q, doc.title, doc.organizationName));

  return (
    <div>
      <PortalHeader
        title="Media"
        subtitle="Every file shared with a brand, franchisee, landlord or investor."
      />

      <ListToolbar
        action="/portal/admin/media"
        placeholder="Search by file name or organization…"
        query={q}
      />

      {allRows.length === 0 ? (
        <EmptyState>Nothing uploaded yet.</EmptyState>
      ) : rows.length === 0 ? (
        <EmptyState>No files match that search.</EmptyState>
      ) : (
        <div className="space-y-2">
          {rows.map((doc) => (
            <ListRow
              key={doc.id}
              title={
                <div className="flex items-center gap-3">
                  <MediaThumb url={doc.url} alt={doc.title} />
                  <DocumentLink url={doc.url}>{doc.title}</DocumentLink>
                </div>
              }
              meta={
                <Link
                  href={`/portal/admin/${orgTypeMeta(doc.organizationType).slug}/${doc.organizationId}`}
                  className="hover:text-violet-600"
                >
                  {doc.organizationName}
                </Link>
              }
              trailing={
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone="neutral">{doc.kind}</Pill>
                  <ActionForm
                    action={renameDocument}
                    submitLabel="Rename"
                    pendingLabel="…"
                    successMessage="Renamed."
                    hiddenFields={{ id: doc.id }}
                    size="sm"
                    variant="secondary"
                    layout="inline"
                  >
                    <span className="w-40">
                      <Input name="title" defaultValue={doc.title} />
                    </span>
                  </ActionForm>
                  <ActionForm
                    action={deleteDocument}
                    submitLabel="Delete"
                    pendingLabel="…"
                    successMessage="Deleted."
                    hiddenFields={{ id: doc.id }}
                    size="sm"
                    variant="secondary"
                    layout="inline"
                  />
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
