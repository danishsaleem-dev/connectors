import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/current-user";
import { ActionForm } from "@/components/portal/ActionForm";
import { MediaPicker } from "@/components/portal/MediaPicker";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { Panel } from "@/components/portal/ui";
import { Checkbox, Field, Input, Textarea } from "@/components/ui";
import { saveConsultant } from "@/lib/portal/actions";

export const metadata: Metadata = {
  title: "Add consultant",
  robots: { index: false, follow: false },
};

export default async function AdminConsultantNewPage() {
  await requireAdmin();

  return (
    <div>
      <PortalHeader
        title="Add consultant"
        subtitle={
          <Link href="/portal/admin/consultants" className="hover:text-violet-600">
            ← Back to consultants
          </Link>
        }
      />

      <Panel>
        <ActionForm
          action={saveConsultant}
          submitLabel="Add consultant"
          pendingLabel="Adding…"
          successMessage="Consultant added — find them in the list, or add another below."
        >
          <Field label="Name" className="sm:col-span-2">
            <Input name="name" required placeholder="e.g. Priya Anand" />
          </Field>
          <Field
            label="Areas of expertise"
            hint="Comma-separated — e.g. Site Selection, Franchise Structuring"
            className="sm:col-span-2"
          >
            <Input name="expertise" placeholder="Site Selection, Franchise Structuring" />
          </Field>
          <Field label="Years of experience">
            <Input name="yearsExperience" type="number" min={0} />
          </Field>
          <Field label="Bio" className="sm:col-span-2">
            <Textarea name="bio" rows={4} />
          </Field>
          <Field label="Photo" className="sm:col-span-2">
            <MediaPicker name="photoUrl" organizationId={null} />
          </Field>
          <div className="flex items-end pb-2 sm:col-span-2">
            <Checkbox name="isPublished" label="Publish to the public consultants page" />
          </div>
        </ActionForm>
      </Panel>
    </div>
  );
}
