import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
  brandProfiles,
  consultants,
  developerProfiles,
  franchiseeProfiles,
  investorProfiles,
  landlordProfiles,
  organizations,
  users,
  vendorProfiles,
  type OrgType,
} from "@/lib/db/schema";
import { uniqueConsultantSlug } from "@/lib/portal/consultant-slug";
import { SELF_SERVICE_TYPES, VENDOR_DISCIPLINE_LABEL, slugify } from "@/lib/portal/domain";
import { hashPassword } from "./password";

export type CreateAccountInput = {
  type: OrgType;
  organizationName: string;
  name: string;
  email: string;
  password: string;
  discipline?: string;
};

export type CreateAccountResult =
  | { ok: true; user: typeof users.$inferSelect }
  | { ok: false; error: string };

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Creates the empty profile row matching the organization's type, so the
 * onboarding wizard always has a record to update rather than having to
 * branch on insert-vs-update. */
async function createProfileFor(
  type: OrgType,
  organizationId: string,
  orgName: string,
  discipline?: string | null,
) {
  const db = getDb();
  switch (type) {
    case "brand":
      await db.insert(brandProfiles).values({ organizationId });
      break;
    case "franchisee":
      await db.insert(franchiseeProfiles).values({ organizationId });
      break;
    case "landlord":
      await db.insert(landlordProfiles).values({ organizationId });
      break;
    case "developer":
      await db.insert(developerProfiles).values({ organizationId });
      break;
    case "investor":
      await db.insert(investorProfiles).values({ organizationId });
      break;
    case "vendor":
      // Discipline is captured at signup rather than left to onboarding —
      // it's the one field that makes a new partner immediately placeable,
      // which is the whole promise of the programme. Slug is seeded from
      // the org name, matching the admin-created path in portal/actions.ts.
      await db.insert(vendorProfiles).values({
        organizationId,
        slug: `${slugify(orgName)}-${organizationId.slice(0, 6)}`,
        ...(discipline
          ? { discipline: discipline as (typeof vendorProfiles.$inferInsert)["discipline"] }
          : {}),
      });
      break;
    case "consultant": {
      // orgName doubles as the person's own name here — a consultant signs
      // up as themselves, not a company (see RegisterForm's "Full name"
      // label for this type). Same public-slug convention as the admin
      // "add consultant" form, so a link looks the same either way it was
      // created; the row stays unpublished until an admin reviews it.
      const [firstName, ...rest] = orgName.split(" ");
      await db.insert(consultants).values({
        organizationId,
        firstName: firstName || orgName,
        lastName: rest.join(" ") || null,
        name: orgName,
        slug: await uniqueConsultantSlug(orgName),
      });
      break;
    }
  }
}

/** Shared by the web register Server Action and the mobile JSON API — same
 * validation, same DB writes, so a self-service signup behaves identically
 * regardless of which surface it came through. */
export async function createAccount(input: CreateAccountInput): Promise<CreateAccountResult> {
  const type = input.type;
  const orgName = input.organizationName.trim();
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const rawDiscipline = (input.discipline ?? "").trim();
  // Validated against the label map rather than trusted from the caller —
  // the column is an enum, so an unrecognised value would fail the insert.
  const discipline =
    type === "vendor" && VENDOR_DISCIPLINE_LABEL[rawDiscipline] ? rawDiscipline : null;

  if (!SELF_SERVICE_TYPES.includes(type)) {
    return { ok: false, error: "Choose an account type." };
  }
  if (orgName.length < 2) return { ok: false, error: "Enter your company or organization name." };
  if (name.length < 2) return { ok: false, error: "Enter your name." };
  if (!isValidEmail(email)) return { ok: false, error: "Enter a valid email address." };
  if (password.length < 8) return { ok: false, error: "Use a password of at least 8 characters." };
  if (type === "vendor" && !discipline) return { ok: false, error: "Choose what you do." };

  try {
    const db = getDb();
    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing) return { ok: false, error: "An account with that email already exists." };

    const [org] = await db.insert(organizations).values({ name: orgName, type }).returning();

    await createProfileFor(type, org.id, orgName, discipline);

    const passwordHash = await hashPassword(password);
    const [user] = await db
      .insert(users)
      .values({ email, name, organizationId: org.id, passwordHash })
      .returning();

    return { ok: true, user };
  } catch (err) {
    console.error("[portal] registration failed", err);
    return { ok: false, error: "Something went wrong creating your account. Please try again." };
  }
}
