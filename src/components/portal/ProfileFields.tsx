import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui";
import { MediaPicker, type MediaValue } from "@/components/portal/MediaPicker";
import { RepeatableEntries } from "@/components/portal/RepeatableEntries";
import { INDUSTRIES, VENDOR_DISCIPLINE_LABEL } from "@/lib/portal/domain";
import type { ConsultantEducation, ConsultantExperience, OrgType } from "@/lib/db/schema";

/**
 * The qualifying questions for each participant type, in one place.
 *
 * Used by three surfaces — the onboarding wizard, a participant's profile
 * page, and the admin's edit view — which all post to actions that share the
 * same `writeProfile` reader. Adding a field means touching this file and
 * that reader, not six forms.
 *
 * Array fields are submitted as comma-separated strings; the action's `list`
 * helper accepts either that or repeated checkbox entries.
 */

type ProfileRecord = Record<string, unknown> | null | undefined;

function text(profile: ProfileRecord, key: string) {
  const value = profile?.[key];
  if (value == null) return "";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

function checked(profile: ProfileRecord, key: string) {
  return Boolean(profile?.[key]);
}

export function ProfileFields({
  type,
  profile,
  organizationId,
  logoPreview,
  experienceFileUrls = [],
  educationFileUrls = [],
}: {
  type: OrgType;
  profile: ProfileRecord;
  /** Only used by the brand branch's logo picker. Null on the "Add brand"
   * create page — no org exists yet, so the picker uses the current admin's
   * own holding area instead of scoping to one. */
  organizationId?: string | null;
  /** The existing logo/photo, pre-resolved to a signed URL by the caller (a
   * Server Component, where resolveMediaUrl actually lives) — this file
   * stays a plain sync component. Doubles as the consultant branch's photo
   * preview, same MediaValue shape either way. */
  logoPreview?: MediaValue | null;
  /** Signed URLs for the consultant branch's Experience/Education file
   * attachments, index-aligned with profile.experience/education — same
   * convention as the admin consultant edit page. */
  experienceFileUrls?: (string | null)[];
  educationFileUrls?: (string | null)[];
}) {
  if (type === "brand") {
    return (
      <>
        <Field label="Brand logo" className="sm:col-span-2">
          <MediaPicker
            name="logo"
            organizationId={organizationId ?? null}
            initial={logoPreview ? [logoPreview] : []}
          />
        </Field>
        <Field label="Industry" className="sm:col-span-2">
          <Select name="industry" defaultValue={text(profile, "industry")}>
            <option value="">Select an industry</option>
            {INDUSTRIES.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="About the brand" className="sm:col-span-2">
          <Textarea name="description" defaultValue={text(profile, "description")} rows={3} />
        </Field>
        <Field label="Website">
          <Input name="website" type="url" defaultValue={text(profile, "website")} />
        </Field>
        <Field label="Year founded">
          <Input name="foundedYear" type="number" defaultValue={text(profile, "foundedYear")} />
        </Field>
        <Field label="Outlets currently open">
          <Input name="outletCount" type="number" defaultValue={text(profile, "outletCount")} />
        </Field>
        <Field label="Countries present" hint="Comma separated">
          <Input
            name="countriesPresent"
            defaultValue={text(profile, "countriesPresent")}
            placeholder="United Kingdom, Pakistan"
          />
        </Field>
        <Field label="Space required (sq ft)">
          <Input
            name="spaceRequiredSqft"
            type="number"
            defaultValue={text(profile, "spaceRequiredSqft")}
          />
        </Field>
        <div className="sm:col-span-2">
          <Checkbox
            name="isFranchising"
            defaultChecked={checked(profile, "isFranchising")}
            label="We offer franchise opportunities"
          />
        </div>
        <Field label="Franchise investment from">
          <Input
            name="franchiseInvestmentMin"
            type="number"
            defaultValue={text(profile, "franchiseInvestmentMin")}
          />
        </Field>
        <Field label="Franchise investment to">
          <Input
            name="franchiseInvestmentMax"
            type="number"
            defaultValue={text(profile, "franchiseInvestmentMax")}
          />
        </Field>
        <Field label="Franchise fee">
          <Input name="franchiseFee" type="number" defaultValue={text(profile, "franchiseFee")} />
        </Field>
        <Field label="Royalty %">
          <Input
            name="royaltyPercent"
            type="number"
            defaultValue={text(profile, "royaltyPercent")}
          />
        </Field>
      </>
    );
  }

  if (type === "franchisee") {
    return (
      <>
        <Field label="Investment budget from">
          <Input name="budgetMin" type="number" defaultValue={text(profile, "budgetMin")} />
        </Field>
        <Field label="Investment budget to">
          <Input name="budgetMax" type="number" defaultValue={text(profile, "budgetMax")} />
        </Field>
        <Field label="Preferred cities" hint="Comma separated" className="sm:col-span-2">
          <Input
            name="preferredCities"
            defaultValue={text(profile, "preferredCities")}
            placeholder="London, Manchester"
          />
        </Field>
        <Field label="Industries of interest" hint="Comma separated" className="sm:col-span-2">
          <Input
            name="industriesInterested"
            defaultValue={text(profile, "industriesInterested")}
            placeholder="Food & Beverage, Fitness & Wellness"
          />
        </Field>
        <Field label="Years of business experience">
          <Input
            name="experienceYears"
            type="number"
            defaultValue={text(profile, "experienceYears")}
          />
        </Field>
        <div className="self-end pb-2">
          <Checkbox
            name="hasExistingBusiness"
            defaultChecked={checked(profile, "hasExistingBusiness")}
            label="I already operate a business"
          />
        </div>
        <Field label="Anything else" className="sm:col-span-2">
          <Textarea name="notes" defaultValue={text(profile, "notes")} rows={3} />
        </Field>
      </>
    );
  }

  if (type === "landlord") {
    return (
      <>
        <Field label="Cities you hold property in" hint="Comma separated" className="sm:col-span-2">
          <Input name="cities" defaultValue={text(profile, "cities")} placeholder="London, Lahore" />
        </Field>
        <Field label="Number of units in portfolio">
          <Input name="portfolioSize" type="number" defaultValue={text(profile, "portfolioSize")} />
        </Field>
        <Field label="Anything else" className="sm:col-span-2">
          <Textarea name="notes" defaultValue={text(profile, "notes")} rows={3} />
        </Field>
      </>
    );
  }

  if (type === "developer") {
    return (
      <>
        <Field label="Project name">
          <Input name="projectName" defaultValue={text(profile, "projectName")} />
        </Field>
        <Field label="Project type">
          <Select name="projectType" defaultValue={text(profile, "projectType")}>
            <option value="">Select</option>
            <option value="Shopping mall">Shopping mall</option>
            <option value="Mixed-use development">Mixed-use development</option>
            <option value="Lifestyle destination">Lifestyle destination</option>
            <option value="Commercial project">Commercial project</option>
          </Select>
        </Field>
        <Field label="City">
          <Input name="city" defaultValue={text(profile, "city")} />
        </Field>
        <Field label="Total units">
          <Input name="totalUnits" type="number" defaultValue={text(profile, "totalUnits")} />
        </Field>
        <Field label="Current occupancy %">
          <Input
            name="occupancyPercent"
            type="number"
            defaultValue={text(profile, "occupancyPercent")}
          />
        </Field>
        <Field label="Opening date" hint="Or 'open'">
          <Input name="openingDate" defaultValue={text(profile, "openingDate")} />
        </Field>
        <Field label="Anything else" className="sm:col-span-2">
          <Textarea name="notes" defaultValue={text(profile, "notes")} rows={3} />
        </Field>
      </>
    );
  }

  if (type === "vendor") {
    return (
      <>
        <Field label="Discipline">
          <Select name="discipline" defaultValue={text(profile, "discipline") || "consultant"}>
            {Object.entries(VENDOR_DISCIPLINE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Reference handle" hint="Internal identifier — partner profiles aren't published">
          <Input name="slug" defaultValue={text(profile, "slug")} placeholder="studio-name" />
        </Field>
        <Field
          label="Headline"
          hint="One line, shown under the name"
          className="sm:col-span-2"
        >
          <Input
            name="headline"
            defaultValue={text(profile, "headline")}
            placeholder="Retail interiors for food & beverage rollouts"
          />
        </Field>
        <Field label="About" className="sm:col-span-2">
          <Textarea name="bio" defaultValue={text(profile, "bio")} rows={5} />
        </Field>
        <Field label="Specialties" hint="Comma separated" className="sm:col-span-2">
          <Input
            name="specialties"
            defaultValue={text(profile, "specialties")}
            placeholder="Store design, Fit-out management, 3D visualisation"
          />
        </Field>
        <Field label="Cities served" hint="Comma separated" className="sm:col-span-2">
          <Input
            name="citiesServed"
            defaultValue={text(profile, "citiesServed")}
            placeholder="London, Dubai, Lahore"
          />
        </Field>
        <Field label="Years experience">
          <Input
            name="yearsExperience"
            type="number"
            defaultValue={text(profile, "yearsExperience")}
          />
        </Field>
        <Field label="Team size">
          <Input name="teamSize" type="number" defaultValue={text(profile, "teamSize")} />
        </Field>
        <Field label="Projects completed">
          <Input
            name="projectsCompleted"
            type="number"
            defaultValue={text(profile, "projectsCompleted")}
          />
        </Field>
        <Field label="Website">
          <Input name="website" type="url" defaultValue={text(profile, "website")} />
        </Field>
        <Field label="Contact email" className="sm:col-span-2">
          <Input name="contactEmail" type="email" defaultValue={text(profile, "contactEmail")} />
        </Field>
        <div className="sm:col-span-2">
          <Checkbox
            name="isPublished"
            defaultChecked={checked(profile, "isPublished")}
            label="Vetted — available to place on projects"
          />
        </div>
      </>
    );
  }

  if (type === "investor") {
    return (
      <>
        <Field label="Ticket size from">
          <Input name="ticketMin" type="number" defaultValue={text(profile, "ticketMin")} />
        </Field>
        <Field label="Ticket size to">
          <Input name="ticketMax" type="number" defaultValue={text(profile, "ticketMax")} />
        </Field>
        <Field label="Sectors of interest" hint="Comma separated" className="sm:col-span-2">
          <Input
            name="sectors"
            defaultValue={text(profile, "sectors")}
            placeholder="Food & Beverage, Retail Chains"
          />
        </Field>
        <Field label="Investment types" hint="Comma separated" className="sm:col-span-2">
          <Input
            name="investmentTypes"
            defaultValue={text(profile, "investmentTypes")}
            placeholder="Equity, Joint venture, Multi-unit franchise"
          />
        </Field>
        <Field label="Horizon (months)">
          <Input name="horizonMonths" type="number" defaultValue={text(profile, "horizonMonths")} />
        </Field>
        <Field label="Anything else" className="sm:col-span-2">
          <Textarea name="notes" defaultValue={text(profile, "notes")} rows={3} />
        </Field>
      </>
    );
  }

  // type === "consultant" — the roster profile itself. isPublished and the
  // display name stay admin-only (see /portal/admin/consultants), so this
  // is only what the consultant is trusted to keep current themselves.
  return (
    <>
      <Field label="Photo" className="sm:col-span-2">
        <MediaPicker
          name="photo"
          organizationId={organizationId ?? null}
          initial={logoPreview ? [logoPreview] : []}
        />
      </Field>
      <Field label="Areas of expertise" hint="Comma separated" className="sm:col-span-2">
        <Input
          name="expertise"
          defaultValue={text(profile, "expertise")}
          placeholder="Site selection, Franchise structuring"
        />
      </Field>
      <Field label="Years of experience">
        <Input name="yearsExperience" type="number" defaultValue={text(profile, "yearsExperience")} />
      </Field>
      <Field label="Bio" className="sm:col-span-2">
        <Textarea name="bio" defaultValue={text(profile, "bio")} rows={5} />
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
          initial={(profile?.experience as ConsultantExperience[] | undefined) ?? []}
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
          initial={(profile?.education as ConsultantEducation[] | undefined) ?? []}
          existingFileUrls={educationFileUrls}
        />
      </div>
    </>
  );
}
