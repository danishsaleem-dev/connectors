import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db/client";
import { enquiries, organizations, requests, users } from "@/lib/db/schema";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { SavedNotes } from "@/components/portal/SavedNotes";
import { EmptyState, ListRow, Panel, Pill, StatCard } from "@/components/portal/ui";
import { ORG_TYPES, REQUEST_TYPE_LABEL, orgTypeMeta } from "@/lib/portal/domain";

export const metadata: Metadata = {
  title: "Admin Overview",
  robots: { index: false, follow: false },
};

export default async function AdminOverviewPage() {
  const admin = await requireAdmin();
  const db = getDb();

  const [allOrgs, allUsers, openRequests, newEnquiries] = await Promise.all([
    db.select().from(organizations),
    db.select().from(users),
    db
      .select()
      .from(requests)
      .where(eq(requests.status, "open"))
      .orderBy(desc(requests.createdAt))
      .limit(5),
    db
      .select()
      .from(enquiries)
      .where(eq(enquiries.status, "new"))
      .orderBy(desc(enquiries.createdAt))
      .limit(5),
  ]);

  const orgName = new Map(allOrgs.map((o) => [o.id, o.name]));

  return (
    <div>
      <PortalHeader title="Overview" subtitle={`Signed in as ${admin.name}`} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ORG_TYPES.map((meta) => (
          <StatCard
            key={meta.type}
            label={meta.plural}
            value={allOrgs.filter((o) => o.type === meta.type).length}
            href={`/portal/admin/${meta.slug}`}
          />
        ))}
        <StatCard label="Portal accounts" value={allUsers.length} href="/portal/admin/accounts" />
        <StatCard
          label="New enquiries"
          value={newEnquiries.length}
          href="/portal/admin/enquiries"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="New enquiries">
          {newEnquiries.length === 0 ? (
            <EmptyState>Nothing new from the public site.</EmptyState>
          ) : (
            <div className="space-y-2">
              {newEnquiries.map((enquiry) => (
                <ListRow
                  key={enquiry.id}
                  href={`/portal/admin/enquiries/${enquiry.id}`}
                  title={enquiry.companyName || enquiry.name}
                  meta={orgTypeMeta(enquiry.source).singular}
                  trailing={<Pill tone="amber">New</Pill>}
                />
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Open requests">
          {openRequests.length === 0 ? (
            <EmptyState>Nothing waiting on you.</EmptyState>
          ) : (
            <div className="space-y-2">
              {openRequests.map((request) => (
                <ListRow
                  key={request.id}
                  href="/portal/admin/requests"
                  title={request.title}
                  meta={orgName.get(request.organizationId)}
                  trailing={<Pill tone="amber">{REQUEST_TYPE_LABEL[request.type]}</Pill>}
                />
              ))}
            </div>
          )}
        </Panel>
      </div>

      <Panel title="Recently added" className="mt-6">
        {allOrgs.length === 0 ? (
          <EmptyState>No organizations yet.</EmptyState>
        ) : (
          <div className="space-y-2">
            {[...allOrgs]
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .slice(0, 5)
              .map((org) => {
                const meta = orgTypeMeta(org.type);
                return (
                  <ListRow
                    key={org.id}
                    href={`/portal/admin/${meta.slug}/${org.id}`}
                    title={org.name}
                    meta={meta.singular}
                    trailing={
                      <Pill tone={org.onboardingCompletedAt ? "green" : "amber"}>
                        {org.onboardingCompletedAt ? "Onboarded" : "Pending"}
                      </Pill>
                    }
                  />
                );
              })}
          </div>
        )}
      </Panel>

      <SavedNotes />
    </div>
  );
}
