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
  {
    type: "vendor",
    slug: "vendors",
    singular: "Vendor",
    plural: "Vendors & Partners",
    // A vendor's portal job is keeping its own public directory profile
    // current — it doesn't submit requests or list space.
    requestTypes: [],
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
 * directly, since capital relationships start with a conversation. Vendors
 * apply through /become-a-vendor and are onboarded after vetting — a public
 * directory listing isn't something you grant on self-signup. */
export const SELF_SERVICE_TYPES: OrgType[] = ["brand", "franchisee", "landlord", "developer"];

/** URL-safe slug for a vendor's public directory profile. Lives here rather
 * than in actions.ts because that file's top-level "use server" would turn a
 * plain helper into a callable server action. */
export function slugify(value: string) {
  return value
    .normalize("NFKD")
    // Strip combining diacritics (U+0300-U+036F) by codepoint rather than a
    // regex character class: literal combining marks in source do not survive
    // every editor/tool round-trip, so this file stays pure ASCII.
    .split("")
    .filter((ch) => {
      const cp = ch.codePointAt(0) ?? 0;
      return cp < 0x0300 || cp > 0x036f;
    })
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export const VENDOR_DISCIPLINE_LABEL: Record<string, string> = {
  designer: "Designer",
  architect: "Architect",
  interior: "Interior Specialist",
  agency: "Agency",
  consultant: "Consultant",
  contractor: "Contractor",
};

/** Plural forms for the directory's filter chips. */
export const VENDOR_DISCIPLINE_PLURAL: Record<string, string> = {
  designer: "Designers",
  architect: "Architects",
  interior: "Interior Specialists",
  agency: "Agencies",
  consultant: "Consultants",
  contractor: "Contractors",
};

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
