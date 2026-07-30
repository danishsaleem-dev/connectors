import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db/client";
import { enquiries } from "@/lib/db/schema";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { EmptyState, ListRow, Pill } from "@/components/portal/ui";
import { orgTypeMeta } from "@/lib/portal/domain";

export const metadata: Metadata = {
  title: "Enquiries",
  robots: { index: false, follow: false },
};

const STATUS_TONE = {
  new: "amber",
  converted: "green",
  archived: "neutral",
} as const;

export default async function AdminEnquiriesPage() {
  await requireAdmin();

  const rows = await getDb().select().from(enquiries).orderBy(desc(enquiries.createdAt));
  const newCount = rows.filter((r) => r.status === "new").length;

  return (
    <div>
      <PortalHeader
        title="Enquiries"
        subtitle={
          newCount > 0
            ? `${newCount} new from the public site, waiting for review.`
            : "Submissions from the public enquiry forms."
        }
      />

      {rows.length === 0 ? (
        <EmptyState>Nothing submitted yet.</EmptyState>
      ) : (
        <div className="space-y-2">
          {rows.map((enquiry) => (
            <ListRow
              key={enquiry.id}
              href={`/portal/admin/enquiries/${enquiry.id}`}
              title={enquiry.companyName || enquiry.name}
              meta={`${orgTypeMeta(enquiry.source).singular} · ${enquiry.email} · ${enquiry.createdAt.toLocaleDateString()}`}
              trailing={
                <div className="flex items-center gap-2">
                  {enquiry.transcript && <Pill tone="violet">Chat</Pill>}
                  <Pill tone={STATUS_TONE[enquiry.status]}>
                    {enquiry.status === "new"
                      ? "New"
                      : enquiry.status === "converted"
                        ? "Converted"
                        : "Archived"}
                  </Pill>
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
