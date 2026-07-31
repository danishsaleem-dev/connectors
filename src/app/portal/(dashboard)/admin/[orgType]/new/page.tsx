import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/current-user";
import { ActionForm } from "@/components/portal/ActionForm";
import { ProfileFields } from "@/components/portal/ProfileFields";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { Panel } from "@/components/portal/ui";
import { Field, Input } from "@/components/ui";
import { createOrganization } from "@/lib/portal/actions";
import { orgTypeBySlug } from "@/lib/portal/domain";

/** One route serves all five "add organization" forms, same reasoning as the
 * list page it's linked from. */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orgType: string }>;
}): Promise<Metadata> {
  const { orgType } = await params;
  const meta = orgTypeBySlug(orgType);
  return {
    title: meta ? `Add ${meta.singular.toLowerCase()}` : "Not found",
    robots: { index: false, follow: false },
  };
}

export default async function AdminOrgTypeNewPage({
  params,
}: {
  params: Promise<{ orgType: string }>;
}) {
  await requireAdmin();
  const { orgType } = await params;
  const meta = orgTypeBySlug(orgType);
  if (!meta) notFound();

  return (
    <div>
      <PortalHeader
        title={`Add ${meta.singular.toLowerCase()}`}
        subtitle={
          <Link href={`/portal/admin/${meta.slug}`} className="hover:text-violet-600">
            ← Back to {meta.plural.toLowerCase()}
          </Link>
        }
      />

      <Panel>
        <ActionForm
          action={createOrganization}
          submitLabel={`Add ${meta.singular.toLowerCase()}`}
          pendingLabel="Adding…"
          successMessage={`${meta.singular} added — find it in the list, or add another below.`}
          hiddenFields={{ type: meta.type }}
        >
          <Field label={`${meta.singular} name`} className="sm:col-span-2">
            <Input name="name" required placeholder="e.g. Northside Coffee Co." />
          </Field>
          <Field label="Phone">
            <Input name="phone" />
          </Field>
          <Field label="Country">
            <Input name="country" />
          </Field>
          <ProfileFields type={meta.type} profile={null} />
        </ActionForm>
      </Panel>
    </div>
  );
}
