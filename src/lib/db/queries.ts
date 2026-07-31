import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "./client";
import {
  brandProfiles,
  developerProfiles,
  franchiseeProfiles,
  investorProfiles,
  landlordProfiles,
  organizations,
  properties,
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
      floorLevel: properties.floorLevel,
      parkingAvailable: properties.parkingAvailable,
      status: properties.status,
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
    .orderBy(desc(properties.createdAt));
}

/* ------------------------------------------------------------------ */
/*  Vendors — the public Partners Program directory                    */
/* ------------------------------------------------------------------ */

/**
 * Published vendor profiles for the public /consultants directory.
 *
 * `isPublished` is the gate: a vendor onboards, fills in their profile, and
 * an admin publishes it. Nothing reaches the public site before that, so a
 * half-finished profile is never exposed. Rows without a slug are excluded
 * too — there'd be no URL to link them to.
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
