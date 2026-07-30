import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui";
import { INDUSTRIES } from "@/lib/portal/domain";
import type { OrgType } from "@/lib/db/schema";

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
}: {
  type: OrgType;
  profile: ProfileRecord;
}) {
  if (type === "brand") {
    return (
      <>
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
