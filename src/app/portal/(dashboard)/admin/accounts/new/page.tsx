import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db/client";
import { organizations } from "@/lib/db/schema";
import { ActionForm } from "@/components/portal/ActionForm";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { Panel } from "@/components/portal/ui";
import { Checkbox, Field, Input, Select } from "@/components/ui";
import { createPortalUser } from "@/lib/portal/actions";
import { orgTypeMeta } from "@/lib/portal/domain";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false, follow: false },
};

export default async function AdminAccountsNewPage() {
  await requireAdmin();
  const allOrgs = await getDb().select().from(organizations).orderBy(organizations.name);

  return (
    <div>
      <PortalHeader
        title="Create account"
        subtitle={
          <Link href="/portal/admin/accounts" className="hover:text-violet-600">
            ← Back to accounts
          </Link>
        }
      />

      <Panel>
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
    </div>
  );
}
