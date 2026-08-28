/**
 * Seeds 5 sample organizations each for brand, franchisee and investor —
 * full accounts (org + profile row + login), not just empty stubs, so the
 * admin portal's listing pages have real-looking content to review instead
 * of sitting empty. Clearly fictional companies/people, not real brands.
 *
 * Idempotent by organization name: re-running skips any org that's already
 * there rather than creating duplicates, so it's safe to run again after
 * adding more entries below.
 *
 * Every seeded account shares one password (printed at the end) rather
 * than 15 different generated ones nobody would note down — this is
 * sample/demo data, not production accounts.
 *
 * Run with:  npx tsx scripts/seed-sample-accounts.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { getDb } from "../src/lib/db/client";
import {
  brandProfiles,
  franchiseeProfiles,
  investorProfiles,
  organizations,
  users,
  type OrgType,
} from "../src/lib/db/schema";
import { hashPassword } from "../src/lib/auth/password";
import { slugify } from "../src/lib/portal/domain";

const SEED_PASSWORD = "Connectors@Seed1";

// organizationId is filled in at insert time (see seedOne) — every literal
// below is just the profile table's own columns.
type BrandSeed = {
  org: string;
  contact: string;
  email: string;
  phone: string;
  country: string;
  profile: Omit<typeof brandProfiles.$inferInsert, "organizationId">;
};

type FranchiseeSeed = {
  org: string;
  contact: string;
  email: string;
  phone: string;
  country: string;
  profile: Omit<typeof franchiseeProfiles.$inferInsert, "organizationId">;
};

type InvestorSeed = {
  org: string;
  contact: string;
  email: string;
  phone: string;
  country: string;
  profile: Omit<typeof investorProfiles.$inferInsert, "organizationId">;
};

const brands: BrandSeed[] = [
  {
    org: "Verona Kitchens",
    contact: "Elena Rossi",
    email: "elena@veronakitchens.example",
    phone: "+44 20 7946 0891",
    country: "United Kingdom",
    profile: {
      industry: "Food & Beverage",
      description:
        "Fast-casual Italian concept with 18 sites across London and the South East, expanding into secondary UK cities.",
      website: "https://veronakitchens.example",
      foundedYear: 2015,
      outletCount: 18,
      countriesPresent: ["United Kingdom"],
      isFranchising: true,
      franchiseInvestmentMin: 150000,
      franchiseInvestmentMax: 280000,
      franchiseFee: 25000,
      royaltyPercent: 6,
      spaceRequiredSqft: 1800,
      currency: "GBP",
    },
  },
  {
    org: "Northbridge Coffee Co.",
    contact: "Marcus Webb",
    email: "marcus@northbridgecoffee.example",
    phone: "+1 512 555 0142",
    country: "United States",
    profile: {
      industry: "Food & Beverage",
      description:
        "Specialty coffee roaster and cafe brand, five company-owned stores in Austin, opening its first franchised locations.",
      website: "https://northbridgecoffee.example",
      foundedYear: 2018,
      outletCount: 5,
      countriesPresent: ["United States"],
      isFranchising: true,
      franchiseInvestmentMin: 220000,
      franchiseInvestmentMax: 400000,
      franchiseFee: 35000,
      royaltyPercent: 5,
      spaceRequiredSqft: 1200,
      currency: "USD",
    },
  },
  {
    org: "Solace Wellness Spa",
    contact: "Zara Ahmed",
    email: "zara@solacewellness.example",
    phone: "+92 42 3577 2210",
    country: "Pakistan",
    profile: {
      industry: "Beauty & Cosmetics",
      description:
        "Boutique day-spa brand, three flagship locations in Lahore, offering master franchise rights across South Asia.",
      website: "https://solacewellness.example",
      foundedYear: 2012,
      outletCount: 3,
      countriesPresent: ["Pakistan"],
      isFranchising: true,
      franchiseInvestmentMin: 60000,
      franchiseInvestmentMax: 150000,
      franchiseFee: 12000,
      royaltyPercent: 7,
      spaceRequiredSqft: 2200,
      currency: "USD",
    },
  },
  {
    org: "Rapid Fit Studios",
    contact: "Tom Bracewell",
    email: "tom@rapidfitstudios.example",
    phone: "+44 161 496 0033",
    country: "United Kingdom",
    profile: {
      industry: "Fitness & Wellness",
      description:
        "30-minute HIIT studio format, 40 units open across the UK, targeting the North of England next.",
      website: "https://rapidfitstudios.example",
      foundedYear: 2016,
      outletCount: 40,
      countriesPresent: ["United Kingdom"],
      isFranchising: true,
      franchiseInvestmentMin: 90000,
      franchiseInvestmentMax: 180000,
      franchiseFee: 18000,
      royaltyPercent: 8,
      spaceRequiredSqft: 2500,
      currency: "GBP",
    },
  },
  {
    org: "Turlington Menswear",
    contact: "David Turlington",
    email: "david@turlingtonmenswear.example",
    phone: "+1 312 555 0198",
    country: "United States",
    profile: {
      industry: "Fashion & Apparel",
      description:
        "Made-to-measure menswear brand, mall and high-street formats, established supply chain and training programme.",
      website: "https://turlingtonmenswear.example",
      foundedYear: 2009,
      outletCount: 22,
      countriesPresent: ["United States", "Canada"],
      isFranchising: true,
      franchiseInvestmentMin: 180000,
      franchiseInvestmentMax: 320000,
      franchiseFee: 25000,
      royaltyPercent: 6,
      spaceRequiredSqft: 1600,
      currency: "USD",
    },
  },
];

const franchisees: FranchiseeSeed[] = [
  {
    org: "Khan Ventures",
    contact: "Ayesha Khan",
    email: "ayesha@khanventures.example",
    phone: "+92 300 1234567",
    country: "Pakistan",
    profile: {
      budgetMin: 50000,
      budgetMax: 150000,
      currency: "USD",
      preferredCities: ["Lahore", "Karachi"],
      industriesInterested: ["Food & Beverage", "Retail Chains"],
      experienceYears: 6,
      hasExistingBusiness: true,
      notes: "Currently operates two retail outlets in Lahore, looking to diversify into F&B.",
    },
  },
  {
    org: "Whitfield Holdings",
    contact: "James Whitfield",
    email: "james@whitfieldholdings.example",
    phone: "+44 7700 900321",
    country: "United Kingdom",
    profile: {
      budgetMin: 100000,
      budgetMax: 300000,
      currency: "GBP",
      preferredCities: ["London", "Manchester"],
      industriesInterested: ["Fitness & Wellness", "Food & Beverage"],
      experienceYears: 12,
      hasExistingBusiness: true,
      notes: "Multi-unit operator, owns three existing franchised gyms, expanding portfolio.",
    },
  },
  {
    org: "Patel Retail Group",
    contact: "Meera Patel",
    email: "meera@patelretailgroup.example",
    phone: "+1 470 555 0117",
    country: "United States",
    profile: {
      budgetMin: 80000,
      budgetMax: 200000,
      currency: "USD",
      preferredCities: ["Atlanta", "Charlotte"],
      industriesInterested: ["Retail Chains", "Beauty & Cosmetics"],
      experienceYears: 4,
      hasExistingBusiness: false,
      notes: "First-time franchisee, background in corporate retail management.",
    },
  },
  {
    org: "Mendes Hospitality",
    contact: "Carlos Mendes",
    email: "carlos@mendeshospitality.example",
    phone: "+1 305 555 0164",
    country: "United States",
    profile: {
      budgetMin: 150000,
      budgetMax: 400000,
      currency: "USD",
      preferredCities: ["Miami", "Orlando"],
      industriesInterested: ["Food & Beverage", "Hospitality"],
      experienceYears: 9,
      hasExistingBusiness: true,
      notes: "Runs two independent restaurants, wants to convert one to a recognised brand.",
    },
  },
  {
    org: "Siddiqui Enterprises",
    contact: "Fatima Siddiqui",
    email: "fatima@siddiquienterprises.example",
    phone: "+92 21 3456 7890",
    country: "Pakistan",
    profile: {
      budgetMin: 40000,
      budgetMax: 120000,
      currency: "USD",
      preferredCities: ["Karachi", "Islamabad"],
      industriesInterested: ["Education", "Retail Chains"],
      experienceYears: 3,
      hasExistingBusiness: false,
      notes: "Former operations manager at a national retail chain, seeking first franchise.",
    },
  },
];

const investors: InvestorSeed[] = [
  {
    org: "Alden Capital Partners",
    contact: "Sophie Alden",
    email: "sophie@aldencapital.example",
    phone: "+44 20 7123 4567",
    country: "United Kingdom",
    profile: {
      ticketMin: 500000,
      ticketMax: 2000000,
      currency: "GBP",
      sectors: ["Food & Beverage", "Fitness & Wellness"],
      horizonMonths: 60,
      investmentTypes: ["Equity", "Joint venture"],
      notes: "Backs multi-unit F&B and fitness operators across the UK and Europe.",
    },
  },
  {
    org: "Meridian Growth Fund",
    contact: "Robert Klein",
    email: "robert@meridiangrowth.example",
    phone: "+1 212 555 0176",
    country: "United States",
    profile: {
      ticketMin: 250000,
      ticketMax: 1000000,
      currency: "USD",
      sectors: ["Retail Chains", "Fitness & Wellness"],
      horizonMonths: 48,
      investmentTypes: ["Equity", "Multi-unit franchise"],
      notes: "Early-stage capital for retail and wellness franchise operators.",
    },
  },
  {
    org: "Sahil Ventures",
    contact: "Sahil Raza",
    email: "sahil@sahilventures.example",
    phone: "+92 42 3210 9876",
    country: "Pakistan",
    profile: {
      ticketMin: 100000,
      ticketMax: 400000,
      currency: "USD",
      sectors: ["Food & Beverage", "Education"],
      horizonMonths: 36,
      investmentTypes: ["Joint venture", "Master franchise"],
      notes: "Regional investor group focused on master franchise deals in South Asia.",
    },
  },
  {
    org: "Crestline Investment Group",
    contact: "Hannah Crestline",
    email: "hannah@crestlineinvest.example",
    phone: "+1 617 555 0129",
    country: "United States",
    profile: {
      ticketMin: 300000,
      ticketMax: 900000,
      currency: "USD",
      sectors: ["Education", "Healthcare"],
      horizonMonths: 54,
      investmentTypes: ["Equity"],
      notes: "Focused on after-school education and healthcare-adjacent franchise concepts.",
    },
  },
  {
    org: "Blackridge Partners",
    contact: "Omar Farooq",
    email: "omar@blackridgepartners.example",
    phone: "+971 4 123 4567",
    country: "United Arab Emirates",
    profile: {
      ticketMin: 750000,
      ticketMax: 3000000,
      currency: "USD",
      sectors: ["Luxury Retail", "Hospitality"],
      horizonMonths: 72,
      investmentTypes: ["Equity", "Master franchise"],
      notes: "Gulf-based family office backing premium retail and hospitality expansion.",
    },
  },
];

async function uniqueSlug(db: ReturnType<typeof getDb>, name: string, taken: Set<string>) {
  const base = slugify(name) || "organization";
  let candidate = base;
  for (let n = 2; taken.has(candidate); n++) candidate = `${base}-${n}`;
  taken.add(candidate);
  return candidate;
}

async function seedOne(
  db: ReturnType<typeof getDb>,
  type: OrgType,
  seed: { org: string; contact: string; email: string; phone: string; country: string },
  writeProfile: (organizationId: string) => Promise<void>,
  taken: Set<string>,
) {
  const [existing] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.name, seed.org))
    .limit(1);
  if (existing) {
    console.log(`  · skipped "${seed.org}" — already exists`);
    return;
  }

  const [org] = await db
    .insert(organizations)
    .values({
      name: seed.org,
      type,
      status: "active",
      onboardingCompletedAt: new Date(),
      phone: seed.phone,
      country: seed.country,
      slug: await uniqueSlug(db, seed.org, taken),
    })
    .returning();

  await writeProfile(org.id);

  const passwordHash = await hashPassword(SEED_PASSWORD);
  await db.insert(users).values({
    email: seed.email,
    name: seed.contact,
    organizationId: org.id,
    passwordHash,
  });

  console.log(`  · created "${seed.org}" (${seed.email})`);
}

async function main() {
  const db = getDb();
  const [existingOrgs] = await Promise.all([
    db.select({ slug: organizations.slug }).from(organizations),
  ]);
  const taken = new Set(existingOrgs.map((o) => o.slug).filter((s): s is string => Boolean(s)));

  console.log("Brands:");
  for (const seed of brands) {
    await seedOne(
      db,
      "brand",
      seed,
      async (organizationId) => {
        await db.insert(brandProfiles).values({ organizationId, ...seed.profile });
      },
      taken,
    );
  }

  console.log("\nFranchisees:");
  for (const seed of franchisees) {
    await seedOne(
      db,
      "franchisee",
      seed,
      async (organizationId) => {
        await db.insert(franchiseeProfiles).values({ organizationId, ...seed.profile });
      },
      taken,
    );
  }

  console.log("\nInvestors:");
  for (const seed of investors) {
    await seedOne(
      db,
      "investor",
      seed,
      async (organizationId) => {
        await db.insert(investorProfiles).values({ organizationId, ...seed.profile });
      },
      taken,
    );
  }

  console.log(`\nDone. Every created account's password: ${SEED_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
