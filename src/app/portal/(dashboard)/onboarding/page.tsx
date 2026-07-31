import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireParticipant } from "@/lib/auth/current-user";
import { getProfile } from "@/lib/db/queries";
import { ActionForm } from "@/components/portal/ActionForm";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { ProfileFields } from "@/components/portal/ProfileFields";
import { Panel } from "@/components/portal/ui";
import { Field, Input } from "@/components/ui";
import { completeOnboarding } from "@/lib/portal/actions";
import { orgTypeMeta } from "@/lib/portal/domain";
import { resolveMediaUrl } from "@/lib/storage/media";

export const metadata: Metadata = {
  title: "Set up your profile",
  robots: { index: false, follow: false },
};

const INTRO: Record<string, string> = {
  brand: "Tell us about your brand. Once you're set up, you can browse space listed by our landlord and developer partners.",
  franchisee:
    "Tell us your budget, territory and experience, then submit a request — our team will follow up directly.",
  landlord: "Tell us about your portfolio, then list your available space for brands to browse.",
  developer: "Tell us about your scheme, then list your available space for brands to browse.",
  investor: "Tell us your ticket size and sectors, then submit a request — our team will follow up directly.",
};

export default async function OnboardingPage() {
  const { organization } = await requireParticipant({ allowOnboarding: true });
  // Nothing to do here once it's done — send them to the dashboard.
  if (organization.onboardingCompletedAt) redirect("/portal");

  const meta = orgTypeMeta(organization.type);
  const profile = await getProfile(organization.type, organization.id);
  const logoPath =
    organization.type === "brand" && typeof profile?.logoUrl === "string" ? profile.logoUrl : null;
  const logoUrl = await resolveMediaUrl(logoPath);

  return (
    <div>
      <PortalHeader
        title="Set up your profile"
        subtitle={`${meta.singular} account · this unlocks the rest of the portal.`}
      />

      <Panel>
        <p className="mb-6 text-sm leading-relaxed text-[var(--muted)]">
          {INTRO[organization.type]}
        </p>

        <ActionForm
          action={completeOnboarding}
          submitLabel="Finish setup"
          pendingLabel="Saving…"
          successMessage="All set — use the sidebar to continue."
          size="lg"
        >
          <Field label="Organization name">
            <Input name="organizationName" defaultValue={organization.name} required />
          </Field>
          <Field label="Phone">
            <Input name="phone" defaultValue={organization.phone ?? ""} />
          </Field>
          <Field label="Country" className="sm:col-span-2">
            <Input name="country" defaultValue={organization.country ?? ""} />
          </Field>
          <ProfileFields
            type={organization.type}
            profile={profile}
            organizationId={organization.id}
            logoPreview={logoPath ? { path: logoPath, url: logoUrl } : null}
          />
        </ActionForm>
      </Panel>
    </div>
  );
}
