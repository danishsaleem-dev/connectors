"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { Resend } from "resend";
import { getCurrentUser } from "@/lib/auth/current-user";
import { hashPassword } from "@/lib/auth/password";
import { getDb } from "@/lib/db/client";
import {
  brandProfiles,
  consultantInquiries,
  consultants,
  developerProfiles,
  documents,
  franchiseOpportunities,
  franchiseeProfiles,
  investorProfiles,
  landlordProfiles,
  media,
  messages,
  organizations,
  properties,
  requests,
  users,
  vendorProfiles,
  type ConsultantEducation,
  type ConsultantExperience,
  type OrgType,
} from "@/lib/db/schema";
import { site } from "@/lib/site";
import { slugify } from "./domain";
import { requireAdminUser, requireOrgUser } from "./guards";

export type ActionState = {
  ok: boolean;
  error?: string;
  /** Only set right after creating a user — the one time the temp password is
   * visible, if there's no RESEND_API_KEY to email it instead. */
  tempPassword?: string;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function str(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length ? value : null;
}

function num(formData: FormData, key: string) {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

/** Unlike num(), doesn't round — used for latitude/longitude, where rounding
 * to the nearest integer degree would put every pin somewhere else entirely. */
function float(formData: FormData, key: string) {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function bool(formData: FormData, key: string) {
  return formData.get(key) != null;
}

/** Accepts either repeated checkbox entries or one comma/newline-separated
 * string — the latter is how the property photo list is submitted. */
function list(formData: FormData, key: string) {
  const all = formData.getAll(key).map((v) => String(v).trim()).filter(Boolean);
  if (all.length > 1) return all;
  if (all.length === 1) {
    return all[0]
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

/** Parses the JSON blob a RepeatableEntries hidden input posts (experience,
 * education), dropping any entry left completely blank. */
function jsonEntries<T extends Record<string, string>>(formData: FormData, key: string): T[] {
  const raw = str(formData, key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e) => e && typeof e === "object" && Object.values(e).some((v) => String(v ?? "").trim()),
    ) as T[];
  } catch {
    return [];
  }
}

/** Revalidates everything under the portal in one call, so new pages don't
 * each need a line here. */
function revalidatePortal() {
  revalidatePath("/portal", "layout");
}

function fail(scope: string, err: unknown, message: string): ActionState {
  console.error(`[portal] ${scope} failed`, err);
  return { ok: false, error: message };
}

function generateTempPassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  return Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 12);
}

/* ------------------------------------------------------------------ */
/*  Profiles & onboarding                                              */
/* ------------------------------------------------------------------ */

/**
 * One action for all five participant types: each profile table is keyed by
 * organizationId and the form only submits fields relevant to its type, so
 * branching happens once here rather than in five near-identical actions.
 */
async function writeProfile(type: OrgType, organizationId: string, formData: FormData) {
  const db = getDb();
  switch (type) {
    case "brand": {
      // The logo field is a path chosen through the media library picker,
      // not a raw file upload — the picker's own action handles uploading and
      // hands back a path string. Only set logoUrl when one was actually
      // chosen, so re-saving the rest of the profile without touching the
      // logo doesn't null out the existing one.
      const logoPath = str(formData, "logo");

      await db
        .update(brandProfiles)
        .set({
          industry: str(formData, "industry"),
          description: str(formData, "description"),
          website: str(formData, "website"),
          foundedYear: num(formData, "foundedYear"),
          outletCount: num(formData, "outletCount"),
          countriesPresent: list(formData, "countriesPresent"),
          isFranchising: bool(formData, "isFranchising"),
          franchiseInvestmentMin: num(formData, "franchiseInvestmentMin"),
          franchiseInvestmentMax: num(formData, "franchiseInvestmentMax"),
          franchiseFee: num(formData, "franchiseFee"),
          royaltyPercent: num(formData, "royaltyPercent"),
          spaceRequiredSqft: num(formData, "spaceRequiredSqft"),
          ...(logoPath ? { logoUrl: logoPath } : {}),
        })
        .where(eq(brandProfiles.organizationId, organizationId));
      break;
    }
    case "franchisee":
      await db
        .update(franchiseeProfiles)
        .set({
          budgetMin: num(formData, "budgetMin"),
          budgetMax: num(formData, "budgetMax"),
          preferredCities: list(formData, "preferredCities"),
          industriesInterested: list(formData, "industriesInterested"),
          experienceYears: num(formData, "experienceYears"),
          hasExistingBusiness: bool(formData, "hasExistingBusiness"),
          notes: str(formData, "notes"),
        })
        .where(eq(franchiseeProfiles.organizationId, organizationId));
      break;
    case "landlord":
      await db
        .update(landlordProfiles)
        .set({
          cities: list(formData, "cities"),
          portfolioSize: num(formData, "portfolioSize"),
          notes: str(formData, "notes"),
        })
        .where(eq(landlordProfiles.organizationId, organizationId));
      break;
    case "developer":
      await db
        .update(developerProfiles)
        .set({
          projectName: str(formData, "projectName"),
          projectType: str(formData, "projectType"),
          city: str(formData, "city"),
          totalUnits: num(formData, "totalUnits"),
          occupancyPercent: num(formData, "occupancyPercent"),
          openingDate: str(formData, "openingDate"),
          notes: str(formData, "notes"),
        })
        .where(eq(developerProfiles.organizationId, organizationId));
      break;
    case "investor":
      await db
        .update(investorProfiles)
        .set({
          ticketMin: num(formData, "ticketMin"),
          ticketMax: num(formData, "ticketMax"),
          sectors: list(formData, "sectors"),
          horizonMonths: num(formData, "horizonMonths"),
          investmentTypes: list(formData, "investmentTypes"),
          notes: str(formData, "notes"),
        })
        .where(eq(investorProfiles.organizationId, organizationId));
      break;
    case "vendor": {
      // A vendor's profile is public-facing, so it carries the two fields no
      // other type has: a URL slug and a publish gate. The slug is derived
      // from the org name when the admin hasn't set one, and only ever
      // written when we have a value — never blanked back to null by a save
      // that didn't include the field.
      const rawSlug = str(formData, "slug");
      const slug = rawSlug ? slugify(rawSlug) : null;

      await db
        .update(vendorProfiles)
        .set({
          discipline: (str(formData, "discipline") ??
            "consultant") as (typeof vendorProfiles.$inferInsert)["discipline"],
          headline: str(formData, "headline"),
          bio: str(formData, "bio"),
          website: str(formData, "website"),
          contactEmail: str(formData, "contactEmail"),
          citiesServed: list(formData, "citiesServed"),
          specialties: list(formData, "specialties"),
          yearsExperience: num(formData, "yearsExperience"),
          teamSize: num(formData, "teamSize"),
          projectsCompleted: num(formData, "projectsCompleted"),
          isPublished: bool(formData, "isPublished"),
          ...(slug ? { slug } : {}),
          ...(str(formData, "logo") ? { logoUrl: str(formData, "logo") } : {}),
          ...(str(formData, "cover") ? { coverUrl: str(formData, "cover") } : {}),
        })
        .where(eq(vendorProfiles.organizationId, organizationId));
      break;
    }
  }
}

export async function saveProfile(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireOrgUser();
    const db = getDb();
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, user.organizationId))
      .limit(1);
    if (!org) return { ok: false, error: "Organization not found." };

    const name = str(formData, "organizationName");
    await db
      .update(organizations)
      .set({
        ...(name ? { name } : {}),
        phone: str(formData, "phone"),
        country: str(formData, "country"),
      })
      .where(eq(organizations.id, org.id));

    await writeProfile(org.type, org.id, formData);
    revalidatePortal();
    return { ok: true };
  } catch (err) {
    return fail("saveProfile", err, "Couldn't save your profile.");
  }
}

/** Same write as saveProfile, plus flipping the gate that unlocks the rest of
 * the portal and moving the organization from pending to active. */
export async function completeOnboarding(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireOrgUser();
    const db = getDb();
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, user.organizationId))
      .limit(1);
    if (!org) return { ok: false, error: "Organization not found." };

    const name = str(formData, "organizationName");
    await db
      .update(organizations)
      .set({
        ...(name ? { name } : {}),
        phone: str(formData, "phone"),
        country: str(formData, "country"),
        onboardingCompletedAt: new Date(),
        status: "active",
      })
      .where(eq(organizations.id, org.id));

    await writeProfile(org.type, org.id, formData);
    revalidatePortal();
    return { ok: true };
  } catch (err) {
    return fail("completeOnboarding", err, "Couldn't complete onboarding.");
  }
}

/* ------------------------------------------------------------------ */
/*  Properties (landlord / developer listings, browsable by brands)    */
/* ------------------------------------------------------------------ */

export async function saveProperty(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Your session has expired — sign in again." };

    const id = str(formData, "id");
    // An admin may act on any organization's property; a participant only on
    // their own, and the org id is taken from their session, never the form.
    const organizationId = user.isAdmin
      ? str(formData, "organizationId")
      : user.organizationId;
    if (!organizationId) return { ok: false, error: "No organization to attach this to." };

    const title = str(formData, "title");
    const city = str(formData, "city");
    if (!title || !city) return { ok: false, error: "Enter a title and city." };

    const values = {
      organizationId,
      title,
      city,
      country: str(formData, "country"),
      propertyType: (str(formData, "propertyType") ??
        "retail_shop") as (typeof properties.$inferInsert)["propertyType"],
      area: str(formData, "area"),
      mapAddress: str(formData, "mapAddress"),
      latitude: float(formData, "latitude"),
      longitude: float(formData, "longitude"),
      sizeSqft: num(formData, "sizeSqft"),
      dimensions: str(formData, "dimensions"),
      parkingAvailable: bool(formData, "parkingAvailable"),
      status: (str(formData, "status") ??
        "available") as (typeof properties.$inferInsert)["status"],
      description: str(formData, "description"),
      photos: list(formData, "photos"),
      video: str(formData, "video"),
      // Retired from every property form's UI, but a save shouldn't silently
      // wipe historical data on records that still have it — only touch
      // these columns when a form actually posts them.
      ...(formData.has("floorLevel") ? { floorLevel: str(formData, "floorLevel") } : {}),
      ...(formData.has("rentAmount")
        ? { rentAmount: num(formData, "rentAmount"), rentPeriod: str(formData, "rentPeriod") ?? "month" }
        : {}),
      ...(formData.has("availableFrom") ? { availableFrom: str(formData, "availableFrom") } : {}),
    };

    const db = getDb();
    if (id) {
      await db
        .update(properties)
        .set(values)
        .where(
          user.isAdmin
            ? eq(properties.id, id)
            : and(eq(properties.id, id), eq(properties.organizationId, organizationId)),
        );
    } else {
      await db.insert(properties).values(values);
    }

    revalidatePortal();
    return { ok: true };
  } catch (err) {
    return fail("saveProperty", err, "Couldn't save that property.");
  }
}

export async function deleteProperty(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Your session has expired — sign in again." };
    const id = str(formData, "id");
    if (!id) return { ok: false, error: "Missing property." };
    if (!user.isAdmin && !user.organizationId) {
      return { ok: false, error: "No organization on your account." };
    }

    await getDb()
      .delete(properties)
      .where(
        user.isAdmin
          ? eq(properties.id, id)
          : and(
              eq(properties.id, id),
              eq(properties.organizationId, user.organizationId as string),
            ),
      );

    revalidatePortal();
    return { ok: true };
  } catch (err) {
    return fail("deleteProperty", err, "Couldn't remove that property.");
  }
}

/* ------------------------------------------------------------------ */
/*  Franchise opportunities (what a brand is offering, and where)      */
/* ------------------------------------------------------------------ */

export async function saveFranchiseOpportunity(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdminUser();
    const organizationId = str(formData, "organizationId");
    const title = str(formData, "title");
    const city = str(formData, "city");
    if (!organizationId) return { ok: false, error: "No brand to attach this to." };
    if (!title || !city) return { ok: false, error: "Enter a title and city." };

    await getDb().insert(franchiseOpportunities).values({
      organizationId,
      title,
      city,
      country: str(formData, "country"),
      territory: str(formData, "territory"),
      investmentMin: num(formData, "investmentMin"),
      investmentMax: num(formData, "investmentMax"),
      spaceRequiredSqft: num(formData, "spaceRequiredSqft"),
      status: (str(formData, "status") ??
        "available") as (typeof franchiseOpportunities.$inferInsert)["status"],
      description: str(formData, "description"),
    });

    revalidatePortal();
    return { ok: true };
  } catch (err) {
    return fail("saveFranchiseOpportunity", err, "Couldn't save that opportunity.");
  }
}

export async function deleteFranchiseOpportunity(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdminUser();
    const id = str(formData, "id");
    if (!id) return { ok: false, error: "Missing opportunity." };

    await getDb().delete(franchiseOpportunities).where(eq(franchiseOpportunities.id, id));

    revalidatePortal();
    return { ok: true };
  } catch (err) {
    return fail("deleteFranchiseOpportunity", err, "Couldn't remove that opportunity.");
  }
}

/* ------------------------------------------------------------------ */
/*  Consultants — Connectors' own in-house consultancy roster          */
/* ------------------------------------------------------------------ */

/** Admin-only, no organization involved — this is Connectors' own roster,
 * not a participant-owned record, so there's no ownership branching. */
export async function saveConsultant(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdminUser();
    const id = str(formData, "id");
    const name = str(formData, "name");
    if (!name) return { ok: false, error: "Enter a name." };

    const values = {
      name,
      photoUrl: str(formData, "photoUrl"),
      expertise: list(formData, "expertise"),
      yearsExperience: num(formData, "yearsExperience"),
      bio: str(formData, "bio"),
      experience: jsonEntries<ConsultantExperience>(formData, "experience"),
      education: jsonEntries<ConsultantEducation>(formData, "education"),
      isPublished: bool(formData, "isPublished"),
      sortOrder: num(formData, "sortOrder") ?? 0,
    };

    const db = getDb();
    if (id) {
      // `slug` is deliberately not in `values` — it's set once on create and
      // never rewritten, so an edit can't break existing profile links.
      await db.update(consultants).set(values).where(eq(consultants.id, id));
    } else {
      await db.insert(consultants).values({ ...values, slug: await uniqueConsultantSlug(name) });
    }

    revalidatePortal();
    revalidatePath("/consultants");
    return { ok: true };
  } catch (err) {
    return fail("saveConsultant", err, "Couldn't save that consultant.");
  }
}

/** Name-derived handle for the public profile URL, with a numeric suffix if
 * two consultants share a name — the column is unique, so a collision would
 * otherwise fail the insert outright. */
async function uniqueConsultantSlug(name: string) {
  const base = slugify(name) || "consultant";
  const rows = await getDb().select({ slug: consultants.slug }).from(consultants);
  const taken = new Set(rows.map((r) => r.slug).filter(Boolean));
  if (!taken.has(base)) return base;
  for (let i = 2; i < 100; i++) {
    if (!taken.has(`${base}-${i}`)) return `${base}-${i}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function deleteConsultant(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdminUser();
    const id = str(formData, "id");
    if (!id) return { ok: false, error: "Missing consultant." };

    await getDb().delete(consultants).where(eq(consultants.id, id));

    revalidatePortal();
    revalidatePath("/consultants");
    return { ok: true };
  } catch (err) {
    return fail("deleteConsultant", err, "Couldn't remove that consultant.");
  }
}

/** Quick publish/unpublish toggle from the admin list row — a Select posting
 * "true"/"false" strings, same idiom as setPropertyStatus's status dropdown,
 * just for a boolean column instead of an enum. */
export async function setConsultantPublished(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdminUser();
    const id = str(formData, "id");
    const isPublished = str(formData, "isPublished");
    if (!id || isPublished === null) return { ok: false, error: "Missing consultant or status." };

    await getDb()
      .update(consultants)
      .set({ isPublished: isPublished === "true" })
      .where(eq(consultants.id, id));

    revalidatePortal();
    revalidatePath("/consultants");
    return { ok: true };
  } catch (err) {
    return fail("setConsultantPublished", err, "Couldn't update that consultant.");
  }
}

/** Quick status change from the consultant inquiries list row. */
export async function setConsultantInquiryStatus(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdminUser();
    const id = str(formData, "id");
    const status = str(formData, "status");
    if (!id || !status) return { ok: false, error: "Missing inquiry or status." };

    await getDb()
      .update(consultantInquiries)
      .set({ status: status as (typeof consultantInquiries.$inferInsert)["status"] })
      .where(eq(consultantInquiries.id, id));

    revalidatePortal();
    return { ok: true };
  } catch (err) {
    return fail("setConsultantInquiryStatus", err, "Couldn't update that inquiry.");
  }
}

/** Admin-only quick action from the properties list — mirrors
 * setRequestStatus rather than reusing saveProperty, which expects a full
 * form's worth of fields. */
export async function setPropertyStatus(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdminUser();
    const id = str(formData, "id");
    const status = str(formData, "status");
    if (!id || !status) return { ok: false, error: "Missing property or status." };

    await getDb()
      .update(properties)
      .set({ status: status as (typeof properties.$inferInsert)["status"] })
      .where(eq(properties.id, id));

    revalidatePortal();
    return { ok: true };
  } catch (err) {
    return fail("setPropertyStatus", err, "Couldn't update that property.");
  }
}

/* ------------------------------------------------------------------ */
/*  Requests — franchisee/investor demand, admin-reviewed only         */
/* ------------------------------------------------------------------ */

export async function createRequest(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireOrgUser();
    const title = str(formData, "title");
    const type = str(formData, "type");
    if (!title) return { ok: false, error: "Give your request a title." };
    if (!type || !["space", "franchise", "investment"].includes(type)) {
      return { ok: false, error: "Choose a request type." };
    }

    await getDb()
      .insert(requests)
      .values({
        organizationId: user.organizationId,
        type: type as (typeof requests.$inferInsert)["type"],
        title,
        cities: list(formData, "cities"),
        industries: list(formData, "industries"),
        budgetMin: num(formData, "budgetMin"),
        budgetMax: num(formData, "budgetMax"),
        sizeSqft: num(formData, "sizeSqft"),
        notes: str(formData, "notes"),
      });

    revalidatePortal();
    return { ok: true };
  } catch (err) {
    return fail("createRequest", err, "Couldn't submit that request.");
  }
}

export async function setRequestStatus(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdminUser();
    const id = str(formData, "id");
    const status = str(formData, "status");
    if (!id || !status) return { ok: false, error: "Missing request or status." };

    await getDb()
      .update(requests)
      .set({ status: status as (typeof requests.$inferInsert)["status"] })
      .where(eq(requests.id, id));

    revalidatePortal();
    return { ok: true };
  } catch (err) {
    return fail("setRequestStatus", err, "Couldn't update that request.");
  }
}

/* ------------------------------------------------------------------ */
/*  Admin: organizations, accounts, org-level documents & messages     */
/* ------------------------------------------------------------------ */

export async function createOrganization(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdminUser();
    const name = str(formData, "name");
    const type = str(formData, "type") as OrgType | null;
    if (!name) return { ok: false, error: "Enter an organization name." };
    if (!type || !["brand", "franchisee", "landlord", "developer", "investor"].includes(type)) {
      return { ok: false, error: "Choose an organization type." };
    }

    const db = getDb();
    const [org] = await db
      .insert(organizations)
      .values({ name, type, status: "active" })
      .returning();

    // Mirrors registration: give every organization its profile row up front
    // so later edits are always an update.
    switch (type) {
      case "brand":
        await db.insert(brandProfiles).values({ organizationId: org.id });
        break;
      case "franchisee":
        await db.insert(franchiseeProfiles).values({ organizationId: org.id });
        break;
      case "landlord":
        await db.insert(landlordProfiles).values({ organizationId: org.id });
        break;
      case "developer":
        await db.insert(developerProfiles).values({ organizationId: org.id });
        break;
      case "investor":
        await db.insert(investorProfiles).values({ organizationId: org.id });
        break;
      case "vendor":
        // Seed the slug from the name so a new vendor already has a valid
        // public URL waiting the moment an admin publishes them.
        await db
          .insert(vendorProfiles)
          .values({ organizationId: org.id, slug: `${slugify(name)}-${org.id.slice(0, 6)}` });
        break;
    }

    // The "add" form asks for the same profile questions as the edit form —
    // fill the row just inserted rather than leaving it blank until the next
    // visit to the org's detail page.
    const phone = str(formData, "phone");
    const country = str(formData, "country");
    if (phone || country) {
      await db.update(organizations).set({ phone, country }).where(eq(organizations.id, org.id));
    }
    await writeProfile(type, org.id, formData);

    // A logo picked before the org existed lives in the holding area
    // (organizationId null). Now that there's a real org, link it — purely
    // for the library's per-org filter; brandProfiles.logoUrl above already
    // has the path regardless.
    const logoPath = str(formData, "logo");
    if (logoPath) {
      await db
        .update(media)
        .set({ organizationId: org.id })
        .where(and(eq(media.path, logoPath), isNull(media.organizationId)));
    }

    revalidatePortal();
    return { ok: true };
  } catch (err) {
    return fail("createOrganization", err, "Couldn't create the organization.");
  }
}

export async function updateOrganization(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdminUser();
    const id = str(formData, "id");
    if (!id) return { ok: false, error: "Missing organization." };

    const db = getDb();
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
    if (!org) return { ok: false, error: "Organization not found." };

    const name = str(formData, "name");
    await db
      .update(organizations)
      .set({
        ...(name ? { name } : {}),
        status: (str(formData, "status") ??
          org.status) as (typeof organizations.$inferInsert)["status"],
        phone: str(formData, "phone"),
        country: str(formData, "country"),
      })
      .where(eq(organizations.id, id));

    await writeProfile(org.type, id, formData);
    revalidatePortal();
    return { ok: true };
  } catch (err) {
    return fail("updateOrganization", err, "Couldn't save those changes.");
  }
}

export async function createPortalUser(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdminUser();

    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const name = str(formData, "name");
    const isAdmin = bool(formData, "isAdmin");
    const organizationId = str(formData, "organizationId");

    if (!email || !name) return { ok: false, error: "Enter a name and email." };
    if (!isAdmin && !organizationId) {
      return { ok: false, error: "Non-admin accounts need an organization." };
    }

    const tempPassword = generateTempPassword();
    const passwordHash = await hashPassword(tempPassword);

    await getDb().insert(users).values({
      email,
      name,
      isAdmin,
      organizationId: isAdmin ? null : organizationId,
      passwordHash,
    });

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.CONTACT_FROM_EMAIL ?? "Connectors Portal <onboarding@resend.dev>",
        to: email,
        subject: "Your Connectors portal access",
        text: `Hi ${name},\n\nYou've been given access to the Connectors partner portal.\n\nEmail: ${email}\nTemporary password: ${tempPassword}\n\nSign in at ${site.name} / Portal and change your password once you're in.`,
      });
      revalidatePortal();
      return { ok: true };
    }

    revalidatePortal();
    return { ok: true, tempPassword };
  } catch (err) {
    return fail(
      "createPortalUser",
      err,
      "Couldn't create that account — check the email isn't already in use.",
    );
  }
}

/**
 * The only password-recovery path in the portal: admin issues a fresh
 * temporary password for an existing account, in place — no new account, no
 * self-service email-a-link flow (that would need a token table and a
 * guaranteed-configured mailer). Same generate/hash/email-or-show-once
 * pattern as createPortalUser.
 */
export async function resetUserPassword(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdminUser();
    const userId = str(formData, "userId");
    if (!userId) return { ok: false, error: "Missing account." };

    const db = getDb();
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) return { ok: false, error: "Account not found." };

    const tempPassword = generateTempPassword();
    const passwordHash = await hashPassword(tempPassword);
    await db.update(users).set({ passwordHash }).where(eq(users.id, userId));

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.CONTACT_FROM_EMAIL ?? "Connectors Portal <onboarding@resend.dev>",
        to: user.email,
        subject: "Your Connectors portal password was reset",
        text: `Hi ${user.name},\n\nYour password for the Connectors partner portal has been reset.\n\nEmail: ${user.email}\nNew temporary password: ${tempPassword}\n\nSign in and you're in.`,
      });
      revalidatePortal();
      return { ok: true };
    }

    revalidatePortal();
    return { ok: true, tempPassword };
  } catch (err) {
    return fail("resetUserPassword", err, "Couldn't reset that password.");
  }
}

export async function createDocument(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdminUser();
    const organizationId = str(formData, "organizationId");
    const title = str(formData, "title");
    const url = str(formData, "url");
    if (!organizationId || !title || !url) {
      return { ok: false, error: "Fill in the title and link." };
    }

    await getDb().insert(documents).values({
      organizationId,
      title,
      url,
      kind: (str(formData, "kind") ?? "document") as (typeof documents.$inferInsert)["kind"],
    });

    revalidatePortal();
    return { ok: true };
  } catch (err) {
    return fail("createDocument", err, "Couldn't add that document.");
  }
}

/** Admin-only, matching createDocument — documents are shared TO an
 * organization by Connectors staff, never uploaded by the org itself, so
 * managing the library (rename/delete) follows the same rule. */
export async function renameDocument(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdminUser();
    const id = str(formData, "id");
    const title = str(formData, "title");
    if (!id || !title) return { ok: false, error: "Enter a name." };

    await getDb().update(documents).set({ title }).where(eq(documents.id, id));

    revalidatePortal();
    return { ok: true };
  } catch (err) {
    return fail("renameDocument", err, "Couldn't rename that file.");
  }
}

export async function deleteDocument(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdminUser();
    const id = str(formData, "id");
    if (!id) return { ok: false, error: "Missing file." };

    await getDb().delete(documents).where(eq(documents.id, id));

    revalidatePortal();
    return { ok: true };
  } catch (err) {
    return fail("deleteDocument", err, "Couldn't delete that file.");
  }
}

/** The general organization ↔ Connectors thread. There is no org ↔ org
 * thread anywhere in the portal — every conversation has Connectors on one
 * side of it. */
export async function postMessage(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Your session has expired — sign in again." };

    const body = str(formData, "body");
    if (!body || body.length < 2) return { ok: false, error: "Write a message first." };

    const organizationId = user.isAdmin ? str(formData, "organizationId") : user.organizationId;
    if (!organizationId) return { ok: false, error: "No organization to post to." };

    await getDb().insert(messages).values({
      organizationId,
      authorName: user.isAdmin ? "Connectors" : user.name,
      authorIsAdmin: user.isAdmin,
      body,
    });

    revalidatePortal();
    return { ok: true };
  } catch (err) {
    return fail("postMessage", err, "Couldn't send that message.");
  }
}
