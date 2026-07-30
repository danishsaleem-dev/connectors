import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db/client";
import { enquiries } from "@/lib/db/schema";
import { ActionForm } from "@/components/portal/ActionForm";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { DetailList, Panel, Pill } from "@/components/portal/ui";
import { archiveEnquiry, convertEnquiry } from "@/lib/portal/enquiry-convert";
import { orgTypeMeta } from "@/lib/portal/domain";

export const metadata: Metadata = {
  title: "Enquiry",
  robots: { index: false, follow: false },
};

export default async function AdminEnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [enquiry] = await getDb().select().from(enquiries).where(eq(enquiries.id, id)).limit(1);
  if (!enquiry) notFound();

  const meta = orgTypeMeta(enquiry.source);

  return (
    <div>
      <PortalHeader
        title={enquiry.companyName || enquiry.name}
        subtitle={`${meta.singular} enquiry · submitted ${enquiry.createdAt.toLocaleString()}`}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <Panel title="Contact">
          <DetailList
            items={[
              { label: "Name", value: enquiry.name },
              { label: "Email", value: enquiry.email },
              { label: "Phone", value: enquiry.phone },
              { label: "Company", value: enquiry.companyName },
              { label: "Type", value: meta.singular },
            ]}
          />

          <div className="mt-6 border-t border-[var(--border)] pt-5">
            {enquiry.status === "converted" && enquiry.convertedOrgId ? (
              <div className="space-y-3">
                <Pill tone="green">Converted</Pill>
                <a
                  href={`/portal/admin/${meta.slug}/${enquiry.convertedOrgId}`}
                  className="block text-sm text-violet-600 underline underline-offset-4"
                >
                  View organization →
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {enquiry.status === "archived" && <Pill tone="neutral">Archived</Pill>}
                <ActionForm
                  action={convertEnquiry}
                  submitLabel={`Convert to ${meta.singular.toLowerCase()}`}
                  pendingLabel="Converting…"
                  successMessage="Converted — refresh to see the link."
                  hiddenFields={{ id: enquiry.id }}
                  className="sm:grid-cols-1"
                />
                {enquiry.status !== "archived" && (
                  <ActionForm
                    action={archiveEnquiry}
                    submitLabel="Archive"
                    pendingLabel="Archiving…"
                    successMessage="Archived."
                    hiddenFields={{ id: enquiry.id }}
                    variant="secondary"
                    className="sm:grid-cols-1"
                  />
                )}
              </div>
            )}
          </div>
        </Panel>

        <Panel title="Submission">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
            {enquiry.summary}
          </pre>
        </Panel>
      </div>
    </div>
  );
}
