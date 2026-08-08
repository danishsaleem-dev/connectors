import "server-only";
import { and, asc, count, countDistinct, desc, eq, inArray, ne } from "drizzle-orm";
import { getDb } from "./client";
import {
  brandProfiles,
  consultantInquiries,
  consultants,
  developerProfiles,
  franchiseeProfiles,
  investorProfiles,
  landlordProfiles,
  notes,
  organizations,
  properties,
  propertyFavorites,
  vendorProfiles,
  type OrgType,
} from "./schema";

/** The profile table for a given participant type, keyed the same way in
 * every case so callers don't branch. */
const PROFILE_TABLES = {
  brand: brandProfiles,
  franchisee: franchiseeProfiles,
  landlord: landlordProfiles,
  developer: developerProfiles,
  investor: investorProfiles,
  vendor: vendorProfiles,
  consultant: consultants,
} as const;

export async function getProfile(type: OrgType, organizationId: string) {
  const table = PROFILE_TABLES[type];
  const [row] = await getDb()
    .select()
    .from(table)
    .where(eq(table.organizationId, organizationId))
    .limit(1);
  return (row ?? null) as Record<string, unknown> | null;
}

/** Landlord/developer orgs a location can be assigned to — an "agent" is
 * just a landlord-type account in this portal, not a separate entity, so
 * one list covers both. Used for the owner picker on the admin location
 * add/edit forms. */
export async function listPropertyOwners() {
  return getDb()
    .select({ id: organizations.id, name: organizations.name, type: organizations.type })
    .from(organizations)
    .where(inArray(organizations.type, ["landlord", "developer"]))
    .orderBy(organizations.name);
}

/**
 * Every listed property, across every landlord and developer. Used by the
 * admin properties view and — filtered to `status: "available"` at the call
 * site — by the brand-facing browse page. There's no per-viewer filtering
 * here beyond that: brands see the same listing data admins do, just without
 * the management actions.
 */
export async function listAllProperties() {
  return getDb()
    .select({
      id: properties.id,
      title: properties.title,
      city: properties.city,
      country: properties.country,
      area: properties.area,
      sizeSqft: properties.sizeSqft,
      dimensions: properties.dimensions,
      floorLevel: properties.floorLevel,
      parkingAvailable: properties.parkingAvailable,
      status: properties.status,
      featured: properties.featured,
      propertyType: properties.propertyType,
      rentAmount: properties.rentAmount,
      rentPeriod: properties.rentPeriod,
      currency: properties.currency,
      availableFrom: properties.availableFrom,
      description: properties.description,
      photos: properties.photos,
      video: properties.video,
      organizationId: properties.organizationId,
      organizationName: organizations.name,
      organizationType: organizations.type,
      createdAt: properties.createdAt,
    })
    .from(properties)
    .innerJoin(organizations, eq(properties.organizationId, organizations.id))
    .orderBy(desc(properties.featured), desc(properties.createdAt));
}

/** A single aggregate query — no per-row Storage calls — so the
 * /available-locations hero can show live counts without giving up the fast,
 * synchronous render the photo-resolving grid below it deliberately can't have. */
export async function getLocationStats() {
  const [row] = await getDb()
    .select({ total: count(), cities: countDistinct(properties.city) })
    .from(properties)
    .where(ne(properties.status, "withdrawn"));
  return row ?? { total: 0, cities: 0 };
}

/* ------------------------------------------------------------------ */
/*  Vendors — the public Partners Program directory                    */
/* ------------------------------------------------------------------ */

/**
 * Published vendor profiles for the Partners Program directory.
 *
 * `isPublished` is the gate: a vendor onboards, fills in their profile, and
 * an admin publishes it. Nothing reaches the public site before that, so a
 * half-finished profile is never exposed. Rows without a slug are excluded
 * too — there'd be no URL to link them to.
 *
 * Not currently linked from any page — /consultants was repurposed to
 * Connectors' own in-house consultancy service (see the `consultants` table
 * and queries below), and this directory doesn't have a public URL of its
 * own yet. Left in place rather than deleted since the vendor sign-up
 * system (Become a Vendor, /partners) is unaffected and still live.
 */
export async function listPublishedVendors(discipline?: string) {
  const rows = await getDb()
    .select({
      organizationId: vendorProfiles.organizationId,
      name: organizations.name,
      country: organizations.country,
      discipline: vendorProfiles.discipline,
      slug: vendorProfiles.slug,
      headline: vendorProfiles.headline,
      citiesServed: vendorProfiles.citiesServed,
      specialties: vendorProfiles.specialties,
      yearsExperience: vendorProfiles.yearsExperience,
      projectsCompleted: vendorProfiles.projectsCompleted,
      logoUrl: vendorProfiles.logoUrl,
      coverUrl: vendorProfiles.coverUrl,
    })
    .from(vendorProfiles)
    .innerJoin(organizations, eq(vendorProfiles.organizationId, organizations.id))
    .where(eq(vendorProfiles.isPublished, true))
    .orderBy(organizations.name);

  const withSlug = rows.filter((r) => r.slug);
  return discipline ? withSlug.filter((r) => r.discipline === discipline) : withSlug;
}

export async function getPublishedVendorBySlug(slug: string) {
  const [row] = await getDb()
    .select({
      organizationId: vendorProfiles.organizationId,
      name: organizations.name,
      country: organizations.country,
      phone: organizations.phone,
      discipline: vendorProfiles.discipline,
      slug: vendorProfiles.slug,
      headline: vendorProfiles.headline,
      bio: vendorProfiles.bio,
      website: vendorProfiles.website,
      contactEmail: vendorProfiles.contactEmail,
      citiesServed: vendorProfiles.citiesServed,
      specialties: vendorProfiles.specialties,
      yearsExperience: vendorProfiles.yearsExperience,
      teamSize: vendorProfiles.teamSize,
      projectsCompleted: vendorProfiles.projectsCompleted,
      logoUrl: vendorProfiles.logoUrl,
      coverUrl: vendorProfiles.coverUrl,
    })
    .from(vendorProfiles)
    .innerJoin(organizations, eq(vendorProfiles.organizationId, organizations.id))
    .where(and(eq(vendorProfiles.slug, slug), eq(vendorProfiles.isPublished, true)))
    .limit(1);
  return row ?? null;
}

/* ------------------------------------------------------------------ */
/*  Consultants — Connectors' own in-house consultancy roster          */
/* ------------------------------------------------------------------ */

/** Every consultant, published or not — used by the admin list page, which
 * needs to show drafts so they can be finished and published. */
export async function listAllConsultants() {
  return getDb()
    .select()
    .from(consultants)
    .orderBy(asc(consultants.sortOrder), desc(consultants.createdAt));
}

/** Published consultants for the public /consultants page. Same isPublished
 * gate as vendors above — a freshly added consultant stays invisible until
 * an admin reviews and publishes the profile. */
export async function listPublishedConsultants() {
  return getDb()
    .select()
    .from(consultants)
    .where(eq(consultants.isPublished, true))
    .orderBy(asc(consultants.sortOrder), desc(consultants.createdAt));
}

/** Every distinct expertise tag already used across the roster, for the
 * admin form's autocomplete — encourages reusing "Site Selection" rather
 * than accumulating "Site selection" / "site-selection" variants. Done in
 * JS rather than a SQL unnest/distinct since the roster is small and this
 * avoids a raw-SQL escape hatch for a one-off list. */
export async function listExpertiseSuggestions() {
  const rows = await getDb().select({ expertise: consultants.expertise }).from(consultants);
  const set = new Set<string>();
  for (const row of rows) {
    for (const tag of row.expertise ?? []) set.add(tag);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

/** Gated the same way as the listing — an unpublished (or not-yet-reviewed)
 * consultant's page 404s rather than being reachable by guessing a URL. */
export async function getPublishedConsultantBySlug(slug: string) {
  const [row] = await getDb()
    .select()
    .from(consultants)
    .where(and(eq(consultants.slug, slug), eq(consultants.isPublished, true)))
    .limit(1);
  return row ?? null;
}

/** Left join, not inner — a consultant can be deleted (consultantId set null
 * by the FK) while the inquiry itself stays on record. */
export async function listConsultantInquiries() {
  return getDb()
    .select({
      id: consultantInquiries.id,
      consultantId: consultantInquiries.consultantId,
      consultantName: consultants.name,
      name: consultantInquiries.name,
      email: consultantInquiries.email,
      message: consultantInquiries.message,
      status: consultantInquiries.status,
      createdAt: consultantInquiries.createdAt,
    })
    .from(consultantInquiries)
    .leftJoin(consultants, eq(consultantInquiries.consultantId, consultants.id))
    .orderBy(desc(consultantInquiries.createdAt));
}

/* ------------------------------------------------------------------ */
/*  Favorites, notes — brand-side locations and the per-user scratchpad */
/* ------------------------------------------------------------------ */

export async function listFavoritePropertyIds(organizationId: string): Promise<Set<string>> {
  const rows = await getDb()
    .select({ propertyId: propertyFavorites.propertyId })
    .from(propertyFavorites)
    .where(eq(propertyFavorites.organizationId, organizationId));
  return new Set(rows.map((r) => r.propertyId));
}

/** Every role gets this, admin included, which is why it's keyed on userId
 * rather than organizationId — admin accounts have no organization. */
export async function listNotes(userId: string) {
  return getDb().select().from(notes).where(eq(notes.userId, userId)).orderBy(desc(notes.createdAt));
}

/* ------------------------------------------------------------------ */
/*  Franchising brands — public listing on /for-franchise               */
/* ------------------------------------------------------------------ */

/**
 * Brands that have flagged themselves as actively franchising, filtered to
 * `status: "active"` organizations only — a brand mid-onboarding or
 * suspended doesn't show up here, same reasoning as the isPublished gates
 * elsewhere (consultants, vendors).
 */
export async function listFranchisingBrands(industry?: string) {
  const rows = await getDb()
    .select({
      organizationId: organizations.id,
      name: organizations.name,
      country: organizations.country,
      logoUrl: brandProfiles.logoUrl,
      industry: brandProfiles.industry,
      description: brandProfiles.description,
      outletCount: brandProfiles.outletCount,
      countriesPresent: brandProfiles.countriesPresent,
      franchiseInvestmentMin: brandProfiles.franchiseInvestmentMin,
      franchiseInvestmentMax: brandProfiles.franchiseInvestmentMax,
      franchiseFee: brandProfiles.franchiseFee,
      currency: brandProfiles.currency,
    })
    .from(brandProfiles)
    .innerJoin(organizations, eq(brandProfiles.organizationId, organizations.id))
    .where(
      and(
        eq(brandProfiles.isFranchising, true),
        eq(organizations.status, "active"),
        industry ? eq(brandProfiles.industry, industry) : undefined,
      ),
    )
    .orderBy(organizations.name);
  return rows;
}
