import "server-only";
import { desc, eq } from "drizzle-orm";
import { getDb } from "./client";
import {
  brandProfiles,
  developerProfiles,
  franchiseeProfiles,
  investorProfiles,
  landlordProfiles,
  organizations,
  properties,
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
