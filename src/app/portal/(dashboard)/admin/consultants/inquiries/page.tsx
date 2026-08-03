import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/current-user";
import { listConsultantInquiries } from "@/lib/db/queries";
import { ActionForm } from "@/components/portal/ActionForm";
import { ListToolbar, matchesQuery } from "@/components/portal/ListToolbar";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { EmptyState, Pill } from "@/components/portal/ui";
import { Select } from "@/components/ui";
import { setConsultantInquiryStatus } from "@/lib/portal/actions";

export const metadata: Metadata = {
  title: "Consultant Inquiries",
  robots: { index: false, follow: false },
};

const STATUS_TONE = { new: "amber", read: "violet", archived: "neutral" } as const;

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "archived", label: "Archived" },
];

export default async function AdminConsultantInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireAdmin();
  const { q, status } = await searchParams;

  const allRows = await listConsultantInquiries();
  const newCount = allRows.filter((r) => r.status === "new").length;
  const rows = allRows.filter(
    (r) =>
      matchesQuery(q, r.name, r.email, r.consultantName) && (!status || r.status === status),
  );

  return (
    <div>
      <PortalHeader
        title="Consultant Inquiries"
        subtitle={
          newCount > 0
            ? `${newCount} new from the public consultants page, waiting for review.`
            : "Submissions from the public consultants page."
        }
      />

      <ListToolbar
        action="/portal/admin/consultants/inquiries"
        placeholder="Search by name, email or consultant…"
        query={q}
        statusOptions={STATUS_OPTIONS}
        statusValue={status}
      />

      {allRows.length === 0 ? (
        <EmptyState>Nothing submitted yet.</EmptyState>
      ) : rows.length === 0 ? (
        <EmptyState>No inquiries match that search.</EmptyState>
      ) : (
        <div className="space-y-3">
          {rows.map((inquiry) => (
            <div
              key={inquiry.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{inquiry.name}</p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    {inquiry.consultantName ?? "Deleted consultant"} · {inquiry.email} ·{" "}
                    {inquiry.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Pill tone={STATUS_TONE[inquiry.status]}>
                    {inquiry.status === "new"
                      ? "New"
                      : inquiry.status === "read"
                        ? "Read"
                        : "Archived"}
                  </Pill>
                  <ActionForm
                    action={setConsultantInquiryStatus}
                    submitLabel="Update"
                    pendingLabel="…"
                    successMessage="Updated."
                    hiddenFields={{ id: inquiry.id }}
                    size="sm"
                    variant="secondary"
                    layout="inline"
                  >
                    <span className="w-28 shrink-0">
                      <Select name="status" defaultValue={inquiry.status}>
                        {STATUS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </Select>
                    </span>
                  </ActionForm>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[var(--foreground)] text-pretty">
                {inquiry.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
