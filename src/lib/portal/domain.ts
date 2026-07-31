import type { OrgType, requestTypeEnum } from "@/lib/db/schema";

/**
 * One place for the vocabulary the whole portal shares: what each participant
 * type is called, which routes apply to it, and the labels for enum values.
 * Pages read from here rather than hardcoding strings, so adding a
 * participant type or a status is a change in one file.
 */

type RequestType = (typeof requestTypeEnum.enumValues)[number];

export type OrgTypeMeta = {
  type: OrgType;
  /** URL segment for the admin module — /portal/admin/<slug>. */
  slug: string;
  singular: string;
  plural: string;
  /** Request types this participant may submit — empty means they don't
   * submit requests at all. */
  requestTypes: RequestType[];
  /** Whether they list space in `properties`. */
  listsProperties: boolean;
  /** Whether they get a read-only view of everyone's listed properties. */
  browsesProperties: boolean;
};

export const ORG_TYPES: OrgTypeMeta[] = [
  {
    type: "brand",
    slug: "brands",
    singular: "Brand",
    plural: "Brands",
    // No self-service request — a brand's only portal action is browsing
    // what's listed. Franchise and investment introductions are handled by
    // Connectors staff directly, outside the portal.
    requestTypes: [],
    listsProperties: false,
    browsesProperties: true,
  },
  {
    type: "franchisee",
    slug: "franchisees",
    singular: "Franchisee",
    plural: "Franchisees",
    requestTypes: ["franchise"],
    listsProperties: false,
    browsesProperties: false,
  },
  {
    type: "landlord",
    slug: "landlords",
    singular: "Landlord",
    plural: "Landlords",
    requestTypes: [],
    listsProperties: true,
    browsesProperties: false,
  },
  {
    type: "developer",
    slug: "developers",
    singular: "Developer",
    plural: "Malls & Developers",
    requestTypes: [],
    listsProperties: true,
    browsesProperties: false,
  },
  {
    type: "investor",
    slug: "investors",
    singular: "Investor",
    plural: "Investors",
    requestTypes: ["investment"],
    listsProperties: false,
    browsesProperties: false,
  },
];

export function orgTypeMeta(type: OrgType): OrgTypeMeta {
  return ORG_TYPES.find((t) => t.type === type)!;
}

export function orgTypeBySlug(slug: string): OrgTypeMeta | undefined {
  return ORG_TYPES.find((t) => t.slug === slug);
}

/** Types a visitor can self-register as. Investors are added by Connectors
 * directly, since capital relationships start with a conversation. */
export const SELF_SERVICE_TYPES: OrgType[] = ["brand", "franchisee", "landlord", "developer"];

export const REQUEST_TYPE_LABEL: Record<RequestType, string> = {
  space: "Location",
  franchise: "Franchise",
  investment: "Investment",
};

export const PROPERTY_TYPE_LABEL: Record<string, string> = {
  retail_shop: "Retail shop",
  commercial_unit: "Commercial unit",
  food_court: "Food court",
  standalone_building: "Standalone building",
  kiosk: "Kiosk",
  showroom: "Showroom",
  office: "Office",
  mixed_use: "Mixed use",
};

export const PROPERTY_STATUS_LABEL: Record<string, string> = {
  available: "Available",
  under_offer: "Under offer",
  leased: "Leased",
  withdrawn: "Withdrawn",
};

export const FRANCHISE_STATUS_LABEL: Record<string, string> = {
  available: "Available",
  reserved: "Reserved",
  awarded: "Awarded",
  withdrawn: "Withdrawn",
};

export const REQUEST_STATUS_LABEL: Record<string, string> = {
  open: "Open",
  in_review: "In review",
  matched: "Matched",
  closed: "Closed",
};

/** Industries from the company profile — used by request and profile forms. */
export const INDUSTRIES = [
  "Food & Beverage",
  "Fashion & Apparel",
  "Beauty & Cosmetics",
  "Retail Chains",
  "Fitness & Wellness",
  "Entertainment",
  "Healthcare",
  "Education",
  "Technology",
  "Lifestyle Brands",
  "Luxury Retail",
  "Hospitality",
] as const;
