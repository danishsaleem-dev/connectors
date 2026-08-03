import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db/client";
import { consultants } from "@/lib/db/schema";
import { ActionForm } from "@/components/portal/ActionForm";
import { MediaPicker } from "@/components/portal/MediaPicker";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { RepeatableEntries } from "@/components/portal/RepeatableEntries";
import { Panel } from "@/components/portal/ui";
import { Checkbox, Field, Input, Textarea } from "@/components/ui";
import { resolveMediaUrl } from "@/lib/storage/media";
import { deleteConsultant, saveConsultant } from "@/lib/portal/actions";

export const metadata: Metadata = {
  title: "Edit consultant",
  robots: { index: false, follow: false },
};

export default async function AdminConsultantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [consultant] = await getDb()
    .select()
    .from(consultants)
    .where(eq(consultants.id, id))
    .limit(1);
  if (!consultant) notFound();

  const photoUrl = await resolveMediaUrl(consultant.photoUrl);

  return (
    <div>
      <PortalHeader
        title={consultant.name}
        subtitle={
          <Link href="/portal/admin/consultants" className="hover:text-violet-600">
            ← Back to consultants
          </Link>
        }
      />

      <Panel>
        <ActionForm action={saveConsultant} submitLabel="Save changes" hiddenFields={{ id: consultant.id }}>
          <Field label="Name" className="sm:col-span-2">
            <Input name="name" defaultValue={consultant.name} required />
          </Field>
          <Field
            label="Areas of expertise"
            hint="Comma-separated — e.g. Site Selection, Franchise Structuring"
            className="sm:col-span-2"
          >
            <Input name="expertise" defaultValue={consultant.expertise?.join(", ") ?? ""} />
          </Field>
          <Field label="Years of experience">
            <Input name="yearsExperience" type="number" min={0} defaultValue={consultant.yearsExperience ?? ""} />
          </Field>
          <Field label="Display order" hint="Lower numbers show first">
            <Input name="sortOrder" type="number" defaultValue={consultant.sortOrder} />
          </Field>
          <Field label="Bio" className="sm:col-span-2">
            <Textarea name="bio" rows={4} defaultValue={consultant.bio ?? ""} />
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
              ]}
              initial={consultant.experience ?? []}
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
              ]}
              initial={consultant.education ?? []}
            />
          </div>

          <Field label="Photo" className="sm:col-span-2">
            <MediaPicker
              name="photoUrl"
              organizationId={null}
              initial={consultant.photoUrl ? [{ path: consultant.photoUrl, url: photoUrl }] : []}
            />
          </Field>
          <div className="flex items-end pb-2 sm:col-span-2">
            <Checkbox
              name="isPublished"
              label="Publish to the public consultants page"
              defaultChecked={consultant.isPublished}
            />
          </div>
        </ActionForm>

        <div className="mt-6 border-t border-[var(--border)] pt-6">
          <ActionForm
            action={deleteConsultant}
            submitLabel="Delete consultant"
            pendingLabel="Deleting…"
            successMessage="Deleted."
            hiddenFields={{ id: consultant.id }}
            variant="secondary"
            size="sm"
          />
        </div>
      </Panel>
    </div>
  );
}
