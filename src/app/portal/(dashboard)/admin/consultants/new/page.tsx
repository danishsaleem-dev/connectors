import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/current-user";
import { ActionForm } from "@/components/portal/ActionForm";
import { MediaPicker } from "@/components/portal/MediaPicker";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { RepeatableEntries } from "@/components/portal/RepeatableEntries";
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

          <div className="sm:col-span-2">
            <span className="mb-2 block text-[13px] font-medium">Experience</span>
            <RepeatableEntries
              name="experience"
              addLabel="Add experience"
              fields={[
                { key: "title", label: "Title", placeholder: "e.g. Franchise Director" },
                { key: "yearFrom", label: "From", placeholder: "2019" },
                { key: "yearTo", label: "To", placeholder: "2022 or Present" },
                { key: "description", label: "Description", type: "textarea", span: 2 },
                { key: "attachment", label: "Supporting document", type: "file", span: 2 },
              ]}
            />
          </div>

          <div className="sm:col-span-2">
            <span className="mb-2 block text-[13px] font-medium">Degrees / certificates</span>
            <RepeatableEntries
              name="education"
              addLabel="Add degree / certificate"
              fields={[
                { key: "title", label: "Title", placeholder: "e.g. MBA, Franchise Management" },
                { key: "year", label: "Year", placeholder: "2018" },
                { key: "description", label: "Description", type: "textarea", span: 2 },
                { key: "attachment", label: "Supporting document", type: "file", span: 2 },
              ]}
            />
          </div>

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
