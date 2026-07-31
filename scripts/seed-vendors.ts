import { config } from "dotenv";
config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { organizations, vendorProfiles } from "@/lib/db/schema";
import { slugify } from "@/lib/portal/domain";

/**
 * Example Partners Program members, so the /consultants directory and profile
 * pages have something to show before real vendors are onboarded.
 *
 * These are EXAMPLES, not real companies — every name is obviously
 * placeholder and no contact detail resolves anywhere real. Delete them from
 * the admin portal (Vendors & Partners) once you have actual partners, or run
 * `npm run db:seed-vendors -- --remove` to take them all out again.
 *
 * They're deliberately created unpublished-then-published in one go so the
 * pages demo properly; nothing here bypasses the publish gate for real
 * vendors created through the portal.
 */

const EXAMPLES = [
  {
    name: "Example Studio — Mono Design",
    country: "United Kingdom",
    discipline: "designer" as const,
    headline: "Retail identity and store concepts for food & beverage rollouts.",
    bio: "Example profile. Mono Design is a placeholder record used to demonstrate the Partners Program directory.\n\nA real profile would describe the studio's approach, the brands it has worked with, and the kind of projects it takes on. Replace or delete this entry from the admin portal.",
    citiesServed: ["London", "Manchester", "Dublin"],
    specialties: ["Store concept design", "Brand identity", "Signage & wayfinding", "Rollout guidelines"],
    yearsExperience: 12,
    teamSize: 18,
    projectsCompleted: 140,
    website: "https://example.com",
    contactEmail: "hello@example.com",
  },
  {
    name: "Example Practice — Northline Architects",
    country: "United Kingdom",
    discipline: "architect" as const,
    headline: "Drawings, approvals and landlord-ready technical packages.",
    bio: "Example profile. Northline Architects is a placeholder record used to demonstrate the Partners Program directory.\n\nReplace or delete this entry from the admin portal once you have real partners onboarded.",
    citiesServed: ["London", "Birmingham", "Leeds"],
    specialties: ["Planning applications", "Landlord approvals", "Technical drawings", "Building regs"],
    yearsExperience: 20,
    teamSize: 34,
    projectsCompleted: 310,
    website: "https://example.com",
    contactEmail: "hello@example.com",
  },
  {
    name: "Example Contractor — Baseline Fit-Out",
    country: "Pakistan",
    discipline: "contractor" as const,
    headline: "Fit-out and site management, handed over on the date agreed.",
    bio: "Example profile. Baseline Fit-Out is a placeholder record used to demonstrate the Partners Program directory.\n\nReplace or delete this entry from the admin portal once you have real partners onboarded.",
    citiesServed: ["Lahore", "Karachi", "Islamabad"],
    specialties: ["Full fit-out", "Site management", "Joinery", "MEP coordination"],
    yearsExperience: 15,
    teamSize: 60,
    projectsCompleted: 220,
    website: "https://example.com",
    contactEmail: "hello@example.com",
  },
  {
    name: "Example Agency — Ninth Street",
    country: "United States",
    discipline: "agency" as const,
    headline: "Opening campaigns and local marketing for new sites.",
    bio: "Example profile. Ninth Street is a placeholder record used to demonstrate the Partners Program directory.\n\nReplace or delete this entry from the admin portal once you have real partners onboarded.",
    citiesServed: ["Las Vegas", "Phoenix", "Los Angeles"],
    specialties: ["Launch campaigns", "Local paid media", "Social content", "Influencer partnerships"],
    yearsExperience: 9,
    teamSize: 22,
    projectsCompleted: 95,
    website: "https://example.com",
    contactEmail: "hello@example.com",
  },
];

async function main() {
  const db = getDb();
  const remove = process.argv.includes("--remove");

  if (remove) {
    for (const example of EXAMPLES) {
      await db.delete(organizations).where(eq(organizations.name, example.name));
    }
    console.log(`Removed ${EXAMPLES.length} example vendors.`);
    return;
  }

  for (const example of EXAMPLES) {
    const [existing] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.name, example.name))
      .limit(1);

    if (existing) {
      console.log(`Skipped (already present): ${example.name}`);
      continue;
    }

    const [org] = await db
      .insert(organizations)
      .values({
        name: example.name,
        type: "vendor",
        status: "active",
        country: example.country,
        onboardingCompletedAt: new Date(),
      })
      .returning();

    await db.insert(vendorProfiles).values({
      organizationId: org.id,
      discipline: example.discipline,
      slug: slugify(example.name),
      isPublished: true,
      headline: example.headline,
      bio: example.bio,
      website: example.website,
      contactEmail: example.contactEmail,
      citiesServed: example.citiesServed,
      specialties: example.specialties,
      yearsExperience: example.yearsExperience,
      teamSize: example.teamSize,
      projectsCompleted: example.projectsCompleted,
    });

    console.log(`Created: ${example.name} → /consultants/${slugify(example.name)}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
