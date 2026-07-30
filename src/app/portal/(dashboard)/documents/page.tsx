import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { requireParticipant } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db/client";
import { documents } from "@/lib/db/schema";
import { DocumentLink } from "@/components/portal/PropertyMedia";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { EmptyState, ListRow, Panel, Pill } from "@/components/portal/ui";

export const metadata: Metadata = {
  title: "Documents",
  robots: { index: false, follow: false },
};

export default async function ParticipantDocumentsPage() {
  const { organization } = await requireParticipant();

  const orgDocs = await getDb()
    .select()
    .from(documents)
    .where(eq(documents.organizationId, organization.id));

  return (
    <div>
      <PortalHeader title="Documents" subtitle="Everything Connectors has shared with you." />

      <Panel>
        <div className="space-y-2">
          {orgDocs.length === 0 ? (
            <EmptyState>Nothing yet.</EmptyState>
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
      </Panel>
    </div>
  );
}
