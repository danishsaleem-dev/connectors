import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db/client";
import { organizations, users } from "@/lib/db/schema";
import { ListToolbar, matchesQuery } from "@/components/portal/ListToolbar";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { ResetPasswordButton } from "@/components/portal/ResetPasswordButton";
import { EmptyState, ListRow, Pill } from "@/components/portal/ui";
import { ButtonLink } from "@/components/ui";
import { orgTypeMeta } from "@/lib/portal/domain";

export const metadata: Metadata = {
  title: "Accounts",
  robots: { index: false, follow: false },
};

export default async function AdminAccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const { q } = await searchParams;
  const db = getDb();

  const [allUsers, allOrgs] = await Promise.all([
    db.select().from(users),
    db.select().from(organizations).orderBy(organizations.name),
  ]);
  const orgById = new Map(allOrgs.map((o) => [o.id, o]));
  const filteredUsers = allUsers.filter((user) =>
    matchesQuery(q, user.name, user.email, orgById.get(user.organizationId ?? "")?.name),
  );

  return (
    <div>
      <PortalHeader
        title="Accounts"
        subtitle="Portal logins for participants and staff."
        action={
          <ButtonLink href="/portal/admin/accounts/new" size="sm">
            Create account
          </ButtonLink>
        }
      />

      <ListToolbar action="/portal/admin/accounts" placeholder="Search by name, email or organization…" query={q} />

      <div className="space-y-2">
        {allUsers.length === 0 ? (
          <EmptyState>No accounts yet.</EmptyState>
        ) : filteredUsers.length === 0 ? (
          <EmptyState>No accounts match that search.</EmptyState>
        ) : (
          filteredUsers.map((user) => {
            const org = user.organizationId ? orgById.get(user.organizationId) : undefined;
            const orgHref = org ? `/portal/admin/${orgTypeMeta(org.type).slug}/${org.id}` : undefined;
            return (
              <ListRow
                key={user.id}
                // The row itself isn't a link — trailing holds a real button,
                // and nesting a <form> inside an <a> is invalid HTML. The org
                // name is the click target instead.
                title={
                  orgHref ? (
                    <Link href={orgHref} className="hover:text-violet-600">
                      {user.name}
                    </Link>
                  ) : (
                    user.name
                  )
                }
                meta={[user.email, org?.name].filter(Boolean).join(" · ")}
                trailing={
                  <div className="flex items-center gap-3">
                    <Pill tone={user.isAdmin ? "violet" : "neutral"}>
                      {user.isAdmin ? "Admin" : org ? orgTypeMeta(org.type).singular : "No org"}
                    </Pill>
                    <ResetPasswordButton userId={user.id} />
                  </div>
                }
              />
            );
          })
        )}
      </div>
    </div>
  );
}
