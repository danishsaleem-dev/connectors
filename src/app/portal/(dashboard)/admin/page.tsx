import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import {
  Building,
  Building2,
  ClipboardList,
  Handshake,
  Inbox,
  Store,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db/client";
import { enquiries, organizations, requests, users } from "@/lib/db/schema";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { SavedNotes } from "@/components/portal/SavedNotes";
import {
  EmptyState,
  Panel,
  Pill,
  RecordList,
  RecordRow,
  SectionHeading,
  StatCard,
} from "@/components/portal/ui";
import { ButtonLink } from "@/components/ui";
import { ORG_TYPES, REQUEST_TYPE_LABEL, orgTypeMeta } from "@/lib/portal/domain";
import type { OrgType } from "@/lib/db/schema";

export const metadata: Metadata = {
  title: "Admin Overview",
  robots: { index: false, follow: false },
};

const ORG_ICON: Record<OrgType, typeof Store> = {
  brand: Store,
  franchisee: Users,
  landlord: Building2,
  developer: Building,
  investor: TrendingUp,
  vendor: Handshake,
  consultant: Users,
};

/** Short, readable "2 hours ago" style stamp — a full date on every row
 * adds noise to a feed whose whole point is recency. */
function ago(date: Date) {
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

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
      .limit(6),
    db
      .select()
      .from(enquiries)
      .where(eq(enquiries.status, "new"))
      .orderBy(desc(enquiries.createdAt))
      .limit(6),
  ]);

  const orgName = new Map(allOrgs.map((o) => [o.id, o.name]));
  const pendingOnboarding = allOrgs.filter((o) => !o.onboardingCompletedAt).length;

  return (
    <div>
      <PortalHeader
        title="Overview"
        subtitle={`Signed in as ${admin.name}`}
        action={
          <ButtonLink href="/portal/admin/enquiries" size="sm" variant="secondary">
            View enquiries
          </ButtonLink>
        }
      />

      {/* The two numbers that actually mean "do something today" lead, ahead
          of the directory counts — those are reference, these are work. */}
      <SectionHeading title="Needs attention" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="New enquiries"
          value={newEnquiries.length}
          href="/portal/admin/enquiries"
          icon={Inbox}
          hint={newEnquiries.length === 0 ? "All caught up" : "From the public site"}
        />
        <StatCard
          label="Open requests"
          value={openRequests.length}
          href="/portal/admin/requests"
          icon={ClipboardList}
          hint={openRequests.length === 0 ? "Nothing waiting" : "Awaiting a reply"}
        />
        <StatCard
          label="Pending onboarding"
          value={pendingOnboarding}
          icon={Users}
          hint={`of ${allOrgs.length} organizations`}
        />
        <StatCard
          label="Portal accounts"
          value={allUsers.length}
          href="/portal/admin/accounts"
          icon={UserPlus}
        />
      </div>

      <SectionHeading title="Directory" className="mt-8" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {ORG_TYPES.map((meta) => (
          <StatCard
            key={meta.type}
            label={meta.plural}
            value={allOrgs.filter((o) => o.type === meta.type).length}
            href={`/portal/admin/${meta.slug}`}
            icon={ORG_ICON[meta.type]}
          />
        ))}
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        <Panel
          title="New enquiries"
          bodyClassName=""
          action={
            <ButtonLink href="/portal/admin/enquiries" size="sm" variant="secondary">
              All
            </ButtonLink>
          }
        >
          {newEnquiries.length === 0 ? (
            <div className="p-5 sm:p-6">
              <EmptyState>Nothing new from the public site.</EmptyState>
            </div>
          ) : (
            newEnquiries.map((enquiry) => (
              <RecordRow
                key={enquiry.id}
                href={`/portal/admin/enquiries/${enquiry.id}`}
                title={enquiry.companyName || enquiry.name}
                subtitle={orgTypeMeta(enquiry.source).singular}
                facts={[{ label: "Received", value: ago(enquiry.createdAt) }]}
                status={<Pill tone="amber">New</Pill>}
              />
            ))
          )}
        </Panel>

        <Panel
          title="Open requests"
          bodyClassName=""
          action={
            <ButtonLink href="/portal/admin/requests" size="sm" variant="secondary">
              All
            </ButtonLink>
          }
        >
          {openRequests.length === 0 ? (
            <div className="p-5 sm:p-6">
              <EmptyState>Nothing waiting on you.</EmptyState>
            </div>
          ) : (
            openRequests.map((request) => (
              <RecordRow
                key={request.id}
                href="/portal/admin/requests"
                title={request.title}
                subtitle={orgName.get(request.organizationId)}
                facts={[{ label: "Opened", value: ago(request.createdAt) }]}
                status={<Pill tone="amber">{REQUEST_TYPE_LABEL[request.type]}</Pill>}
              />
            ))
          )}
        </Panel>
      </div>

      <SectionHeading title="Recently added" className="mt-8" />
      {allOrgs.length === 0 ? (
        <EmptyState>No organizations yet.</EmptyState>
      ) : (
        <RecordList>
          {[...allOrgs]
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 6)
            .map((org) => {
              const meta = orgTypeMeta(org.type);
              return (
                <RecordRow
                  key={org.id}
                  href={`/portal/admin/${meta.slug}/${org.id}`}
                  title={org.name}
                  subtitle={meta.singular}
                  facts={[{ label: "Added", value: ago(org.createdAt) }]}
                  status={
                    <Pill tone={org.onboardingCompletedAt ? "green" : "amber"}>
                      {org.onboardingCompletedAt ? "Onboarded" : "Pending"}
                    </Pill>
                  }
                />
              );
            })}
        </RecordList>
      )}

      <div className="mt-8">
        <SavedNotes />
      </div>
    </div>
  );
}
