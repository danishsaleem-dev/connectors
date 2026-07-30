import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { requireParticipant } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db/client";
import { listAllProperties } from "@/lib/db/queries";
import { documents, properties, requests } from "@/lib/db/schema";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { Panel, StatCard } from "@/components/portal/ui";
import { orgTypeMeta } from "@/lib/portal/domain";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

const NUDGE: Record<string, { href: string; label: string; body: string }> = {
  landlord: {
    href: "/portal/properties",
    label: "My properties",
    body: "List your available space — brands can browse it directly.",
  },
  developer: {
    href: "/portal/properties",
    label: "My properties",
    body: "List your available space — brands can browse it directly.",
  },
  franchisee: {
    href: "/portal/requests",
    label: "My requests",
    body: "Tell us what you're looking for and our team will follow up directly.",
  },
  investor: {
    href: "/portal/requests",
    label: "My requests",
    body: "Tell us what you're looking to back and our team will follow up directly.",
  },
  brand: {
    href: "/portal/locations",
    label: "Locations",
    body: "Browse space listed by our landlord and developer partners.",
  },
};

export default async function ParticipantDashboardPage() {
  const { user, organization } = await requireParticipant();
  const meta = orgTypeMeta(organization.type);
  const db = getDb();

  const [orgRequests, orgProperties, orgDocs, allProperties] = await Promise.all([
    meta.requestTypes.length
      ? db.select().from(requests).where(eq(requests.organizationId, organization.id))
      : Promise.resolve([]),
    meta.listsProperties
      ? db.select().from(properties).where(eq(properties.organizationId, organization.id))
      : Promise.resolve([]),
    db.select().from(documents).where(eq(documents.organizationId, organization.id)),
    meta.browsesProperties ? listAllProperties() : Promise.resolve([]),
  ]);

  const nudge = NUDGE[organization.type];

  return (
    <div>
      <PortalHeader
        title={`Welcome, ${user.name.split(" ")[0]}`}
        subtitle={`${organization.name} · ${meta.singular}`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {meta.listsProperties && (
          <StatCard
            label="Listed properties"
            value={orgProperties.length}
            href="/portal/properties"
          />
        )}
        {meta.requestTypes.length > 0 && (
          <StatCard
            label="Requests submitted"
            value={orgRequests.length}
            href="/portal/requests"
          />
        )}
        {meta.browsesProperties && (
          <StatCard
            label="Locations available"
            value={allProperties.length}
            href="/portal/locations"
          />
        )}
        <StatCard label="Documents shared with you" value={orgDocs.length} href="/portal/documents" />
      </div>

      {nudge && (
        <Panel className="mt-8">
          <p className="text-sm text-[var(--muted)]">
            {nudge.body}{" "}
            <Link href={nudge.href} className="text-violet-600 underline underline-offset-4">
              {nudge.label} →
            </Link>
          </p>
        </Panel>
      )}
    </div>
  );
}
