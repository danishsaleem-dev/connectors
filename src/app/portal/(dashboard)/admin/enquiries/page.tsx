import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db/client";
import { enquiries } from "@/lib/db/schema";
import { ActionForm } from "@/components/portal/ActionForm";
import { ListToolbar, matchesQuery } from "@/components/portal/ListToolbar";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { EmptyState, Pill, RecordList, RecordRow } from "@/components/portal/ui";
import { archiveEnquiry } from "@/lib/portal/enquiry-convert";
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

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "converted", label: "Converted" },
  { value: "archived", label: "Archived" },
];

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireAdmin();
  const { q, status } = await searchParams;

  const allRows = await getDb().select().from(enquiries).orderBy(desc(enquiries.createdAt));
  const newCount = allRows.filter((r) => r.status === "new").length;
  const rows = allRows.filter(
    (enquiry) =>
      matchesQuery(q, enquiry.companyName, enquiry.name, enquiry.email) &&
      (!status || enquiry.status === status),
  );

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

      <ListToolbar
        action="/portal/admin/enquiries"
        placeholder="Search by name, company or email…"
        query={q}
        statusOptions={STATUS_OPTIONS}
        statusValue={status}
      />

      {allRows.length === 0 ? (
        <EmptyState>Nothing submitted yet.</EmptyState>
      ) : rows.length === 0 ? (
        <EmptyState>No enquiries match that search.</EmptyState>
      ) : (
        <RecordList>
          {rows.map((enquiry) => (
            <RecordRow
              key={enquiry.id}
              // actions holds a <form> when the enquiry is still archivable,
              // so the row itself isn't the link — same reasoning as the
              // other list pages.
              title={
                <Link
                  href={`/portal/admin/enquiries/${enquiry.id}`}
                  className="hover:text-violet-600"
                >
                  {enquiry.companyName || enquiry.name}
                </Link>
              }
              subtitle={enquiry.email}
              facts={[
                { label: "Source", value: orgTypeMeta(enquiry.source).singular },
                {
                  label: "Received",
                  value: enquiry.createdAt.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }),
                },
              ]}
              status={
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
              actions={
                enquiry.status === "new" ? (
                  <ActionForm
                    action={archiveEnquiry}
                    submitLabel="Archive"
                    pendingLabel="…"
                    successMessage="Archived."
                    hiddenFields={{ id: enquiry.id }}
                    size="sm"
                    variant="secondary"
                    layout="inline"
                  />
                ) : undefined
              }
            />
          ))}
        </RecordList>
      )}
    </div>
  );
}
