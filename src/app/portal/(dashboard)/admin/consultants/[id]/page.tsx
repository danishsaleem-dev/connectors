import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, or } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db/client";
import { consultants, users } from "@/lib/db/schema";
import { listExpertiseSuggestions } from "@/lib/db/queries";
import { ActionForm } from "@/components/portal/ActionForm";
import { ConsultantLogin } from "@/components/portal/ConsultantLogin";
import { MediaPicker } from "@/components/portal/MediaPicker";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { RepeatableEntries } from "@/components/portal/RepeatableEntries";
import { RichText } from "@/components/portal/RichText";
import { Panel } from "@/components/portal/ui";
import { Checkbox, Field, Input } from "@/components/ui";
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

  // The org-overview surfaces (StatCard, "Recently added") link here using
  // the organization id, since that's what every other org-type detail page
  // is keyed by; the roster list links using the consultant row's own id.
  // Both need to resolve to the same row for a self-registered consultant.
  const [consultant] = await getDb()
    .select()
    .from(consultants)
    .where(or(eq(consultants.id, id), eq(consultants.organizationId, id)))
    .limit(1);
  if (!consultant) notFound();

  const [photoUrl, expertiseSuggestions] = await Promise.all([
    resolveMediaUrl(consultant.photoUrl),
    listExpertiseSuggestions(),
  ]);
  // Null for a consultant the admin typed in by hand — they have no
  // organization and so no account until one is issued below.
  const [account] = consultant.organizationId
    ? await getDb()
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(eq(users.organizationId, consultant.organizationId))
        .limit(1)
    : [];
  const [experienceFileUrls, educationFileUrls] = await Promise.all([
    Promise.all((consultant.experience ?? []).map((e) => resolveMediaUrl(e.attachment))),
    Promise.all((consultant.education ?? []).map((e) => resolveMediaUrl(e.attachment))),
  ]);

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
          <Field label="First name">
            <Input
              name="firstName"
              defaultValue={consultant.firstName ?? consultant.name.split(" ")[0] ?? ""}
              required
            />
          </Field>
          <Field label="Last name">
            <Input
              name="lastName"
              defaultValue={consultant.lastName ?? consultant.name.split(" ").slice(1).join(" ")}
            />
          </Field>
          <Field label="Title" hint="Optional" className="sm:col-span-2">
            <Input
              name="title"
              defaultValue={consultant.title ?? ""}
              placeholder="e.g. Hospitality Operations Consultant"
            />
          </Field>
          <div className="sm:col-span-2">
            <span className="mb-2 block text-[13px] font-medium">Areas of expertise</span>
            <RepeatableEntries
              name="expertise"
              addLabel="Add area of expertise"
              fields={[
                { key: "name", label: "Area", placeholder: "e.g. Site Selection", suggestions: expertiseSuggestions },
                {
                  key: "description",
                  label: "Description",
                  hint: "Optional",
                  type: "textarea",
                  span: 2,
                  placeholder: "Optional — what this covers, in a line or two.",
                },
              ]}
              initial={consultant.expertise ?? []}
            />
          </div>
          <Field
            label="Profile URL"
            hint="Changing this breaks existing links"
            className="sm:col-span-2"
          >
            <Input
              name="slug"
              defaultValue={consultant.slug ?? ""}
              placeholder="firstname-lastname"
            />
            <span className="mt-1 block text-xs text-[var(--muted)]">
              /consultants/{consultant.slug ?? ""}
            </span>
          </Field>
          <Field label="Years of experience">
            <Input name="yearsExperience" type="number" min={0} defaultValue={consultant.yearsExperience ?? ""} />
          </Field>
          <Field label="Display order" hint="Lower numbers show first">
            <Input name="sortOrder" type="number" defaultValue={consultant.sortOrder} />
          </Field>
          <Field label="Bio" className="sm:col-span-2">
            <RichText name="bio" initialHtml={consultant.bio ?? ""} />
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
              initial={consultant.experience ?? []}
              existingFileUrls={experienceFileUrls}
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
              initial={consultant.education ?? []}
              existingFileUrls={educationFileUrls}
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
          <h2 className="text-sm font-medium">Portal login</h2>
          <p className="mb-3 mt-0.5 text-xs text-[var(--muted)]">
            Lets this consultant sign in and maintain their own profile.
          </p>
          <ConsultantLogin
            consultantId={consultant.id}
            account={account ? { id: account.id, email: account.email } : null}
          />
        </div>

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
