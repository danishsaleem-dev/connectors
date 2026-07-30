import type { Metadata } from "next";
import { requireParticipant } from "@/lib/auth/current-user";
import { getProfile } from "@/lib/db/queries";
import { ActionForm } from "@/components/portal/ActionForm";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { ProfileFields } from "@/components/portal/ProfileFields";
import { Panel } from "@/components/portal/ui";
import { Field, Input } from "@/components/ui";
import { saveProfile } from "@/lib/portal/actions";
import { orgTypeMeta } from "@/lib/portal/domain";

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
};

export default async function ParticipantProfilePage() {
  const { organization } = await requireParticipant();
  const meta = orgTypeMeta(organization.type);
  const profile = await getProfile(organization.type, organization.id);

  return (
    <div>
      <PortalHeader
        title="Profile"
        subtitle={`${meta.singular} · this is what our team sees, so keep it current.`}
      />

      <Panel>
        <ActionForm action={saveProfile} submitLabel="Save profile" pendingLabel="Saving…">
          <Field label="Organization name">
            <Input name="organizationName" defaultValue={organization.name} required />
          </Field>
          <Field label="Phone">
            <Input name="phone" defaultValue={organization.phone ?? ""} />
          </Field>
          <Field label="Country" className="sm:col-span-2">
            <Input name="country" defaultValue={organization.country ?? ""} />
          </Field>
          <ProfileFields type={organization.type} profile={profile} />
        </ActionForm>
      </Panel>
    </div>
  );
}
