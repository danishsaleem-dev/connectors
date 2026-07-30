"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
  brandProfiles,
  enquiries,
  franchiseeProfiles,
  investorProfiles,
  landlordProfiles,
  organizations,
  properties,
  requests,
} from "@/lib/db/schema";
import { requireAdminUser } from "./guards";
import type { ActionState } from "./actions";
import type { BrandEnquiryData } from "@/lib/schemas/brand-enquiry";
import type { FranchiseEnquiryData } from "@/lib/schemas/franchise-enquiry";
import type { LandlordEnquiryData } from "@/lib/schemas/landlord-enquiry";
import type { InvestorEnquiryData } from "@/lib/schemas/investor-enquiry";

/** Swaps the literal "Other" option for whatever the visitor typed into the
 * accompanying free-text field — every enquiry form uses this exact pattern. */
function resolveCities(cities: string[], otherCity?: string) {
  return cities
    .map((c) => (c === "Other" ? otherCity : c))
    .filter((c): c is string => Boolean(c));
}

const PROPERTY_TYPE_FROM_LABEL: Record<string, (typeof properties.$inferInsert)["propertyType"]> = {
  "Retail shops": "retail_shop",
  "Commercial units": "commercial_unit",
  "Food court spaces": "food_court",
  "Standalone buildings": "standalone_building",
  Kiosks: "kiosk",
  Showrooms: "showroom",
  "Office spaces": "office",
  "Mixed-use properties": "mixed_use",
};

export async function archiveEnquiry(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdminUser();
    const id = String(formData.get("id") ?? "");
    if (!id) return { ok: false, error: "Missing enquiry." };

    await getDb().update(enquiries).set({ status: "archived" }).where(eq(enquiries.id, id));
    revalidatePath("/portal/admin", "layout");
    return { ok: true };
  } catch (err) {
    console.error("[enquiries] archive failed", err);
    return { ok: false, error: "Couldn't archive that enquiry." };
  }
}

/**
 * Turns a raw web submission into a real participant: an organization, its
 * profile, and the demand or supply record that lets it enter the matching
 * pipeline. This is the only path that creates that pair from an enquiry —
 * nothing happens automatically on submission, so a bad-faith or junk
 * enquiry never becomes a network member without a human deciding so.
 *
 * Only fields with an unambiguous mapping are carried over structurally
 * (cities, industries, sizes). Range values quoted as PKR bands ("500,000 –
 * 1,000,000") are never parsed into the numeric budget columns — that would
 * fabricate precision the source data doesn't have — they're preserved
 * verbatim in the created record's notes/description instead.
 */
export async function convertEnquiry(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdminUser();
    const id = String(formData.get("id") ?? "");
    if (!id) return { ok: false, error: "Missing enquiry." };

    const db = getDb();
    const [enquiry] = await db.select().from(enquiries).where(eq(enquiries.id, id)).limit(1);
    if (!enquiry) return { ok: false, error: "Enquiry not found." };
    if (enquiry.status === "converted") return { ok: false, error: "Already converted." };

    const orgName =
      enquiry.companyName?.trim() ||
      (enquiry.payload as { brandName?: string }).brandName ||
      enquiry.name;

    const [org] = await db
      .insert(organizations)
      .values({
        name: orgName,
        type: enquiry.source,
        status: "active",
        // The enquiry already supplied the qualifying data our own onboarding
        // wizard would otherwise ask for, so there's nothing left to gate.
        onboardingCompletedAt: new Date(),
        phone: enquiry.phone,
      })
      .returning();

    switch (enquiry.source) {
      case "brand": {
        const data = enquiry.payload as BrandEnquiryData;
        const cities = resolveCities(data.cities, data.otherCity);
        await db.insert(brandProfiles).values({
          organizationId: org.id,
          website: data.website || null,
        });
        await db.insert(requests).values({
          organizationId: org.id,
          type: "space",
          title: `Expansion request — ${data.brandName}`,
          cities,
          sizeSqft: data.areaMax,
          notes: enquiry.summary,
        });
        break;
      }
      case "franchisee": {
        const data = enquiry.payload as FranchiseEnquiryData;
        const cities = resolveCities(data.cities, data.otherCity);
        await db.insert(franchiseeProfiles).values({
          organizationId: org.id,
          preferredCities: cities,
          industriesInterested: data.industryInterest,
          hasExistingBusiness: Boolean(data.currentBusiness),
          notes: enquiry.summary,
        });
        await db.insert(requests).values({
          organizationId: org.id,
          type: "franchise",
          title: `Franchise interest — ${data.fullName}`,
          cities,
          industries: data.industryInterest,
          notes: enquiry.summary,
        });
        break;
      }
      case "landlord": {
        const data = enquiry.payload as LandlordEnquiryData;
        const cities = resolveCities(data.cities, data.otherCity);
        await db.insert(landlordProfiles).values({
          organizationId: org.id,
          cities,
          notes: enquiry.summary,
        });
        // Multiple cities can be selected on the form for one submission, but
        // a property is one physical unit in one place — best-effort single
        // listing from the first city, with everything else preserved above.
        await db.insert(properties).values({
          organizationId: org.id,
          title: data.address,
          city: cities[0] ?? "Unknown",
          propertyType: PROPERTY_TYPE_FROM_LABEL[data.propertyTypes[0]] ?? "retail_shop",
          sizeSqft: data.totalAreaSqFt,
          availableFrom: data.availableFrom,
          status: "available",
          description: enquiry.summary,
        });
        break;
      }
      case "investor": {
        const data = enquiry.payload as InvestorEnquiryData;
        const cities = resolveCities(data.cities, data.otherCity);
        await db.insert(investorProfiles).values({
          organizationId: org.id,
          sectors: data.sectorInterest,
          investmentTypes: data.investmentTypes,
          notes: enquiry.summary,
        });
        await db.insert(requests).values({
          organizationId: org.id,
          type: "investment",
          title: `Investment interest — ${data.fullName}`,
          cities,
          industries: data.sectorInterest,
          notes: enquiry.summary,
        });
        break;
      }
    }

    await db
      .update(enquiries)
      .set({ status: "converted", convertedOrgId: org.id })
      .where(eq(enquiries.id, id));

    revalidatePath("/portal/admin", "layout");
    return { ok: true };
  } catch (err) {
    console.error("[enquiries] convert failed", err);
    return { ok: false, error: "Couldn't convert that enquiry." };
  }
}
