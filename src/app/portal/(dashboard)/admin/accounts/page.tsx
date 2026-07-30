import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db/client";
import { organizations, users } from "@/lib/db/schema";
import { ActionForm } from "@/components/portal/ActionForm";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { ResetPasswordButton } from "@/components/portal/ResetPasswordButton";
import { ListRow, Panel, Pill } from "@/components/portal/ui";
import { Checkbox, Field, Input, Select } from "@/components/ui";
import { createPortalUser } from "@/lib/portal/actions";
import { orgTypeMeta } from "@/lib/portal/domain";

export const metadata: Metadata = {
  title: "Accounts",
  robots: { index: false, follow: false },
};

export default async function AdminAccountsPage() {
  await requireAdmin();
  const db = getDb();

  const [allUsers, allOrgs] = await Promise.all([
    db.select().from(users),
    db.select().from(organizations).orderBy(organizations.name),
  ]);
  const orgById = new Map(allOrgs.map((o) => [o.id, o]));

  return (
    <div>
      <PortalHeader title="Accounts" subtitle="Portal logins for participants and staff." />

      <Panel title="Create account">
        <ActionForm
          action={createPortalUser}
          submitLabel="Create account"
          pendingLabel="Creating…"
          successMessage="Account created and invitation emailed."
        >
          <Field label="Name">
            <Input name="name" required />
          </Field>
          <Field label="Email">
            <Input name="email" type="email" required />
          </Field>
          <Field label="Organization" hint="Not needed for admin accounts">
            <Select name="organizationId">
              <option value="">—</option>
              {allOrgs.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} — {orgTypeMeta(org.type).singular}
                </option>
              ))}
            </Select>
          </Field>
          <div className="self-end pb-2">
            <Checkbox name="isAdmin" label="Connectors staff (admin)" />
          </div>
        </ActionForm>
      </Panel>

      <div className="mt-8 space-y-2">
        {allUsers.map((user) => {
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
        })}
      </div>
    </div>
  );
}
