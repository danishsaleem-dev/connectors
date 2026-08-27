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
import { ExpertiseEditor } from "@/components/portal/ExpertiseEditor";
import { FormSections } from "@/components/portal/FormSections";
import { MediaPicker } from "@/components/portal/MediaPicker";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { RepeatableEntries } from "@/components/portal/RepeatableEntries";
import { RichText } from "@/components/portal/RichText";
import { Panel, Pill } from "@/components/portal/ui";
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
  params: Promise<{ handle: string }>;
}) {
  await requireAdmin();
  const { handle } = await params;

  // Resolved by slug first — that's what the roster now links with, and
  // what an admin sees in the address bar. The id and organizationId
  // branches stay because plenty of links still carry them: the org
  // overview's StatCard and "Recently added" key every org-type detail page
  // by organization id, and any bookmark made before slugs were used here
  // carries the consultant row id.
  //
  // Those two columns are uuid, and Postgres casts *every* branch of an OR
  // before evaluating any of them — so including them for a slug handle
  // like "hassan-shahzad" fails the whole query with `invalid input syntax
  // for type uuid` rather than falling through to the slug match. They're
  // only comparable when the handle is actually shaped like a uuid.
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(handle);

  const [consultant] = await getDb()
    .select()
    .from(consultants)
    .where(
      isUuid
        ? or(
            eq(consultants.slug, handle),
            eq(consultants.id, handle),
            eq(consultants.organizationId, handle),
          )
        : eq(consultants.slug, handle),
    )
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
        action={
          <Pill tone={consultant.isPublished ? "green" : "amber"}>
            {consultant.isPublished ? "Published" : "Draft"}
          </Pill>
        }
      />

      <Panel>
        <ActionForm
          action={saveConsultant}
          submitLabel="Save changes"
          hiddenFields={{ id: consultant.id }}
        >
          <div className="sm:col-span-2">
            <FormSections
              sections={[
                {
                  id: "profile",
                  label: "Profile",
                  content: (
                    <>
                      <Field label="First name">
                        <Input
                          name="firstName"
                          defaultValue={
                            consultant.firstName ?? consultant.name.split(" ")[0] ?? ""
                          }
                          required
                        />
                      </Field>
                      <Field label="Last name">
                        <Input
                          name="lastName"
                          defaultValue={
                            consultant.lastName ?? consultant.name.split(" ").slice(1).join(" ")
                          }
                        />
                      </Field>
                      <Field label="Title" hint="Optional" className="sm:col-span-2">
                        <Input
                          name="title"
                          defaultValue={consultant.title ?? ""}
                          placeholder="e.g. Hospitality Operations Consultant"
                        />
                      </Field>
                      <Field label="Years of experience">
                        <Input
                          name="yearsExperience"
                          type="number"
                          min={0}
                          defaultValue={consultant.yearsExperience ?? ""}
                        />
                      </Field>
                      <Field label="Display order" hint="Lower numbers show first">
                        <Input
                          name="sortOrder"
                          type="number"
                          defaultValue={consultant.sortOrder}
                        />
                      </Field>
                      <Field label="Bio" className="sm:col-span-2">
                        <RichText name="bio" initialHtml={consultant.bio ?? ""} />
                      </Field>
                    </>
                  ),
                },
                {
                  id: "expertise",
                  label: "Expertise",
                  badge: consultant.expertise?.length ?? 0,
                  content: (
                    <div className="sm:col-span-2">
                      <span className="mb-1 block text-[13px] font-medium">
                        Areas of expertise
                      </span>
                      <p className="mb-3 text-xs text-[var(--muted)]">
                        Type an area and press Enter. Click any chip to add an optional
                        description.
                      </p>
                      <ExpertiseEditor
                        name="expertise"
                        initial={consultant.expertise ?? []}
                        suggestions={expertiseSuggestions}
                      />
                    </div>
                  ),
                },
                {
                  id: "background",
                  label: "Experience & education",
                  badge:
                    (consultant.experience?.length ?? 0) + (consultant.education?.length ?? 0),
                  content: (
                    <>
                      <div className="sm:col-span-2">
                        <span className="mb-2 block text-[13px] font-medium">Experience</span>
                        <RepeatableEntries
                          name="experience"
                          addLabel="Add experience"
                          fields={[
                            {
                              key: "title",
                              label: "Title",
                              placeholder: "e.g. Franchise Director",
                            },
                            { key: "yearFrom", label: "From", placeholder: "2019" },
                            { key: "yearTo", label: "To", placeholder: "2022 or Present" },
                            {
                              key: "description",
                              label: "Description",
                              type: "textarea",
                              span: 2,
                            },
                            {
                              key: "attachment",
                              label: "Supporting document",
                              type: "file",
                              span: 2,
                            },
                          ]}
                          initial={consultant.experience ?? []}
                          existingFileUrls={experienceFileUrls}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <span className="mb-2 block text-[13px] font-medium">
                          Degrees / certificates
                        </span>
                        <RepeatableEntries
                          name="education"
                          addLabel="Add degree / certificate"
                          fields={[
                            {
                              key: "title",
                              label: "Title",
                              placeholder: "e.g. MBA, Franchise Management",
                            },
                            { key: "year", label: "Year", placeholder: "2018" },
                            {
                              key: "description",
                              label: "Description",
                              type: "textarea",
                              span: 2,
                            },
                            {
                              key: "attachment",
                              label: "Supporting document",
                              type: "file",
                              span: 2,
                            },
                          ]}
                          initial={consultant.education ?? []}
                          existingFileUrls={educationFileUrls}
                        />
                      </div>
                    </>
                  ),
                },
                {
                  id: "publishing",
                  label: "Photo & publishing",
                  content: (
                    <>
                      <Field label="Photo" className="sm:col-span-2">
                        <MediaPicker
                          name="photoUrl"
                          organizationId={null}
                          initial={
                            consultant.photoUrl
                              ? [{ path: consultant.photoUrl, url: photoUrl }]
                              : []
                          }
                        />
                      </Field>
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
                      <div className="flex items-end pb-2 sm:col-span-2">
                        <Checkbox
                          name="isPublished"
                          label="Publish to the public consultants page"
                          defaultChecked={consultant.isPublished}
                        />
                      </div>
                    </>
                  ),
                },
              ]}
            />
          </div>
        </ActionForm>
      </Panel>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Portal login">
          <p className="mb-3 text-xs text-[var(--muted)]">
            Lets this consultant sign in and maintain their own profile.
          </p>
          <ConsultantLogin
            consultantId={consultant.id}
            account={account ? { id: account.id, email: account.email } : null}
          />
        </Panel>

        <Panel title="Danger zone">
          <p className="mb-3 text-xs text-[var(--muted)]">
            Removes the consultant and their public profile. This cannot be undone.
          </p>
          <ActionForm
            action={deleteConsultant}
            submitLabel="Delete consultant"
            pendingLabel="Deleting…"
            successMessage="Deleted."
            hiddenFields={{ id: consultant.id }}
            variant="secondary"
            size="sm"
          />
        </Panel>
      </div>
    </div>
  );
}
