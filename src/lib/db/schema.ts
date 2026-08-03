import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * A flat, role-scoped portal — deliberately not a matching engine. Each
 * participant type signs up, fills in a profile, and does exactly one more
 * thing: a brand browses listed properties, a landlord/developer lists them,
 * a franchisee/investor submits a request. Nothing here links one
 * organization to another — no cross-module visibility, no admin-run
 * matchmaking pipeline. Connectors staff review requests and enquiries and
 * follow up outside the system.
 */

export const orgTypeEnum = pgEnum("org_type", [
  "brand",
  "franchisee",
  "landlord",
  "developer",
  "investor",
  "vendor",
]);

/** The trades in the Partners Program — designers, architects and the rest
 * of the delivery side of an opening. */
export const vendorDisciplineEnum = pgEnum("vendor_discipline", [
  "designer",
  "architect",
  "interior",
  "agency",
  "consultant",
  "contractor",
]);

export const orgStatusEnum = pgEnum("org_status", ["pending", "active", "suspended"]);

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  type: orgTypeEnum("type").notNull(),
  status: orgStatusEnum("status").notNull().default("pending"),
  /** Set when the participant finishes the profile wizard. Null means they
   * are still gated out of everything except onboarding. */
  onboardingCompletedAt: timestamp("onboarding_completed_at", { withTimezone: true }),
  phone: text("phone"),
  country: text("country"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * A user's permissions come from `isAdmin` plus their organization's `type` —
 * the type is never duplicated onto the user, so the two can't drift apart.
 * Admins have no organization.
 */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  organizationId: uuid("organization_id").references(() => organizations.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ------------------------------------------------------------------ */
/*  Per-type profiles                                                  */
/* ------------------------------------------------------------------ */

export const brandProfiles = pgTable("brand_profiles", {
  organizationId: uuid("organization_id")
    .primaryKey()
    .references(() => organizations.id, { onDelete: "cascade" }),
  /** A private Storage path (see resolveMediaUrl), same convention as
   * property photos — never a public URL. */
  logoUrl: text("logo_url"),
  industry: text("industry"),
  description: text("description"),
  website: text("website"),
  foundedYear: integer("founded_year"),
  outletCount: integer("outlet_count"),
  countriesPresent: text("countries_present").array(),
  /** Informational only — there's no in-portal franchise matching; Connectors
   * staff use this when introducing franchisees to a brand manually. */
  isFranchising: boolean("is_franchising").notNull().default(false),
  franchiseInvestmentMin: integer("franchise_investment_min"),
  franchiseInvestmentMax: integer("franchise_investment_max"),
  franchiseFee: integer("franchise_fee"),
  royaltyPercent: integer("royalty_percent"),
  spaceRequiredSqft: integer("space_required_sqft"),
  currency: varchar("currency", { length: 3 }).notNull().default("GBP"),
});

export const franchiseeProfiles = pgTable("franchisee_profiles", {
  organizationId: uuid("organization_id")
    .primaryKey()
    .references(() => organizations.id, { onDelete: "cascade" }),
  budgetMin: integer("budget_min"),
  budgetMax: integer("budget_max"),
  currency: varchar("currency", { length: 3 }).notNull().default("GBP"),
  preferredCities: text("preferred_cities").array(),
  industriesInterested: text("industries_interested").array(),
  experienceYears: integer("experience_years"),
  hasExistingBusiness: boolean("has_existing_business").notNull().default(false),
  notes: text("notes"),
});

/** Landlords and developers both list space, but a landlord fills a unit
 * while a developer fills a scheme — different enough to warrant their own
 * profile shape, while sharing the `properties` inventory table. */
export const landlordProfiles = pgTable("landlord_profiles", {
  organizationId: uuid("organization_id")
    .primaryKey()
    .references(() => organizations.id, { onDelete: "cascade" }),
  cities: text("cities").array(),
  portfolioSize: integer("portfolio_size"),
  notes: text("notes"),
});

export const developerProfiles = pgTable("developer_profiles", {
  organizationId: uuid("organization_id")
    .primaryKey()
    .references(() => organizations.id, { onDelete: "cascade" }),
  projectName: text("project_name"),
  projectType: text("project_type"),
  city: text("city"),
  totalUnits: integer("total_units"),
  occupancyPercent: integer("occupancy_percent"),
  openingDate: text("opening_date"),
  notes: text("notes"),
});

export const investorProfiles = pgTable("investor_profiles", {
  organizationId: uuid("organization_id")
    .primaryKey()
    .references(() => organizations.id, { onDelete: "cascade" }),
  ticketMin: integer("ticket_min"),
  ticketMax: integer("ticket_max"),
  currency: varchar("currency", { length: 3 }).notNull().default("GBP"),
  sectors: text("sectors").array(),
  horizonMonths: integer("horizon_months"),
  investmentTypes: text("investment_types").array(),
  notes: text("notes"),
});

/**
 * Partners Program members — the delivery side (designers, architects,
 * interior specialists, agencies, consultants, contractors).
 *
 * Unlike every other participant type, a vendor has a *public* face: the
 * /consultants directory renders straight from these rows. That's what
 * `slug` and `isPublished` are for — nothing appears on the public site
 * until an admin publishes it, so an unfinished profile is never exposed.
 */
export const vendorProfiles = pgTable("vendor_profiles", {
  organizationId: uuid("organization_id")
    .primaryKey()
    .references(() => organizations.id, { onDelete: "cascade" }),
  discipline: vendorDisciplineEnum("discipline").notNull().default("consultant"),
  /** URL segment for /consultants/<slug>. Unique so the public route can
   * resolve one profile unambiguously. */
  slug: text("slug").unique(),
  isPublished: boolean("is_published").notNull().default(false),
  /** One-line positioning shown under the name in the directory. */
  headline: text("headline"),
  bio: text("bio"),
  website: text("website"),
  contactEmail: text("contact_email"),
  citiesServed: text("cities_served").array(),
  specialties: text("specialties").array(),
  yearsExperience: integer("years_experience"),
  teamSize: integer("team_size"),
  projectsCompleted: integer("projects_completed"),
  /** Private Storage paths, same convention as brand logos. */
  logoUrl: text("logo_url"),
  coverUrl: text("cover_url"),
});

/* ------------------------------------------------------------------ */
/*  Properties — listed by landlords/developers, browsable by brands   */
/* ------------------------------------------------------------------ */

export const propertyTypeEnum = pgEnum("property_type", [
  "retail_shop",
  "commercial_unit",
  "food_court",
  "standalone_building",
  "kiosk",
  "showroom",
  "office",
  "mixed_use",
]);

export const propertyStatusEnum = pgEnum("property_status", [
  "available",
  "under_offer",
  "leased",
  "withdrawn",
]);

export const properties = pgTable("properties", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  propertyType: propertyTypeEnum("property_type").notNull().default("retail_shop"),
  city: text("city").notNull(),
  country: text("country"),
  area: text("area"),
  /** Free-text formatted address for now. Reserved for a Google Places
   * picker once there's an API key — latitude/longitude are already here so
   * adding the picker later needs no migration, just a UI change. */
  mapAddress: text("map_address"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  sizeSqft: integer("size_sqft"),
  floorLevel: text("floor_level"),
  parkingAvailable: boolean("parking_available").notNull().default(false),
  rentAmount: integer("rent_amount"),
  rentPeriod: text("rent_period").default("month"),
  currency: varchar("currency", { length: 3 }).notNull().default("GBP"),
  availableFrom: text("available_from"),
  status: propertyStatusEnum("status").notNull().default("available"),
  description: text("description"),
  /** Paste-in links for now — same convention as `documents.url` — rather
   * than a direct upload pipeline, which would need Vercel Blob wired in
   * before this can ship. */
  photos: text("photos").array(),
  video: text("video"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ------------------------------------------------------------------ */
/*  Requests — franchisee/investor demand, admin-reviewed only         */
/* ------------------------------------------------------------------ */

export const requestTypeEnum = pgEnum("request_type", ["space", "franchise", "investment"]);
export const requestStatusEnum = pgEnum("request_status", [
  "open",
  "in_review",
  "matched",
  "closed",
]);

/**
 * A franchisee or investor tells Connectors what they're looking for; nobody
 * else in the portal ever sees this row. There's no matching workflow
 * attached to it — Connectors staff follow up directly using the contact
 * details on the organization, and update `status` here purely for their
 * own tracking.
 */
export const requests = pgTable("requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  type: requestTypeEnum("type").notNull(),
  title: text("title").notNull(),
  cities: text("cities").array(),
  industries: text("industries").array(),
  budgetMin: integer("budget_min"),
  budgetMax: integer("budget_max"),
  currency: varchar("currency", { length: 3 }).notNull().default("GBP"),
  sizeSqft: integer("size_sqft"),
  notes: text("notes"),
  status: requestStatusEnum("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ------------------------------------------------------------------ */
/*  Documents & messages — org ↔ Connectors, not org ↔ org             */
/* ------------------------------------------------------------------ */

export const documentKindEnum = pgEnum("document_kind", ["document", "agreement"]);

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  url: text("url").notNull(),
  kind: documentKindEnum("kind").notNull().default("document"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const franchiseStatusEnum = pgEnum("franchise_status", [
  "available",
  "reserved",
  "awarded",
  "withdrawn",
]);

/**
 * Franchise opportunities a brand is offering — the franchise-side mirror of
 * `properties`. Owned by a brand organization, managed by Connectors staff on
 * that brand's page. Nothing links these to a franchisee: matchmaking happens
 * outside the portal (see the schema note at the top), so this is a record of
 * what's on offer and where, not a booking system.
 */
export const franchiseOpportunities = pgTable("franchise_opportunities", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  city: text("city").notNull(),
  country: text("country"),
  territory: text("territory"),
  investmentMin: integer("investment_min"),
  investmentMax: integer("investment_max"),
  currency: varchar("currency", { length: 3 }).notNull().default("GBP"),
  spaceRequiredSqft: integer("space_required_sqft"),
  status: franchiseStatusEnum("status").notNull().default("available"),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * The media library's index — one row per uploaded file, independent of
 * whatever field ends up pointing at it (a brand's logoUrl, a property's
 * photos[], a document's url are all still plain path strings; this table
 * exists so the picker modal has something to list, search and browse).
 *
 * organizationId is nullable on purpose: a logo picked or uploaded before an
 * org exists (the "Add brand" form) lands here with organizationId null and
 * uploadedByUserId set instead, then gets claimed (organizationId filled in)
 * once the org is actually created — see createOrganization.
 */
export const media = pgTable("media", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").references(() => organizations.id, {
    onDelete: "cascade",
  }),
  uploadedByUserId: uuid("uploaded_by_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  path: text("path").notNull(),
  filename: text("filename").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ------------------------------------------------------------------ */
/*  Consultants — Connectors' own in-house consultancy roster          */
/* ------------------------------------------------------------------ */

/** Connectors' own consultants, offered as a service to brands, franchisees
 * and landlords — distinct from vendorProfiles (the Partners Program's
 * external, self-onboarding designers/architects/contractors). No
 * organization owns a row here; admins manage the roster directly, and
 * isPublished gates what the public /consultants page shows. */
export const consultants = pgTable("consultants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  photoUrl: text("photo_url"),
  expertise: text("expertise").array(),
  yearsExperience: integer("years_experience"),
  bio: text("bio"),
  isPublished: boolean("is_published").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Deliberately its own table, not folded into `enquiries` below — a
 * consultant inquiry is about one specific consultant (no org-type concept
 * applies) and never becomes a portal organization the way the four public
 * enquiry forms can via convertEnquiry, so it doesn't share their lifecycle. */
export const consultantInquiryStatusEnum = pgEnum("consultant_inquiry_status", [
  "new",
  "read",
  "archived",
]);

export const consultantInquiries = pgTable("consultant_inquiries", {
  id: uuid("id").defaultRandom().primaryKey(),
  consultantId: uuid("consultant_id").references(() => consultants.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  status: consultantInquiryStatusEnum("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  authorName: text("author_name").notNull(),
  authorIsAdmin: boolean("author_is_admin").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ------------------------------------------------------------------ */
/*  Public enquiries — the top of the funnel                           */
/* ------------------------------------------------------------------ */

/** Matches orgTypeEnum minus "developer" — the four public enquiry forms,
 * one per self-service audience the marketing site targets. */
export const enquirySourceEnum = pgEnum("enquiry_source", [
  "brand",
  "franchisee",
  "landlord",
  "investor",
  "vendor",
]);

export const enquiryStatusEnum = pgEnum("enquiry_status", ["new", "converted", "archived"]);

/**
 * Raw submissions from the four public forms. `payload` keeps the full
 * validated form data as JSON rather than four near-duplicate tables mirroring
 * each schema — the shapes differ enough (PKR range strings, per-audience
 * fields) that forcing them into typed columns here would either lose
 * precision or invent structure the source data doesn't have. `summary` is
 * the same human-readable text the notification email already sends, reused
 * rather than re-derived.
 *
 * Converting one into a real organization is an explicit admin action (see
 * convertEnquiry) — nothing here creates a portal account on its own.
 */
export type ChatTranscript = { role: "user" | "assistant"; text: string }[];

export const enquiries = pgTable("enquiries", {
  id: uuid("id").defaultRandom().primaryKey(),
  source: enquirySourceEnum("source").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  companyName: text("company_name"),
  summary: text("summary").notNull(),
  payload: jsonb("payload").notNull().$type<Record<string, unknown>>(),
  /**
   * The conversation that produced a lead captured by the site assistant, so an
   * admin can read what the visitor actually asked before replying. Null for
   * form submissions — its presence is what distinguishes a chat lead from a
   * form lead, which is why there's no separate channel column saying the same
   * thing a second time.
   */
  transcript: jsonb("transcript").$type<ChatTranscript>(),
  status: enquiryStatusEnum("status").notNull().default("new"),
  convertedOrgId: uuid("converted_org_id").references(() => organizations.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type OrgType = (typeof orgTypeEnum.enumValues)[number];
export type EnquirySource = (typeof enquirySourceEnum.enumValues)[number];
