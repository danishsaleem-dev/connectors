/**
 * Adds and backfills `slug` on organizations and properties, so admin detail
 * URLs can read /portal/admin/landlords/acme-properties instead of a uuid.
 *
 * Deliberately additive and idempotent — safe to re-run:
 *   - ADD COLUMN IF NOT EXISTS (nullable, no default) touches no existing data
 *   - the backfill only fills rows where slug IS NULL, so a second run is a
 *     no-op rather than a rename that would break links made in between
 *   - the unique index is created last and only after collisions are
 *     resolved, so it can't fail the migration halfway
 *
 * Run with:  npx tsx scripts/add-admin-slugs.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import postgres from "postgres";
// The app's own slugify — it already handles the combining-diacritic
// stripping correctly (and documents why a literal regex class is unsafe
// here), so the backfill produces exactly the handles the app would.
import { slugify } from "../src/lib/portal/domain";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set — check .env.local");

  const sql = postgres(url, { max: 1, prepare: false });

  try {
    for (const table of ["organizations", "properties"] as const) {
      await sql`ALTER TABLE ${sql(table)} ADD COLUMN IF NOT EXISTS slug text`;
      console.log(`· ${table}: slug column present`);
    }

    // Seed every slug in one pass per table so uniqueness is settled here
    // rather than relying on the database to reject a duplicate mid-loop.
    const taken = new Set<string>();

    const orgs = await sql<{ id: string; name: string; slug: string | null }[]>`
      SELECT id, name, slug FROM organizations ORDER BY created_at
    `;
    for (const row of orgs) if (row.slug) taken.add(row.slug);

    let orgFilled = 0;
    for (const row of orgs) {
      if (row.slug) continue;
      const base = slugify(row.name) || "organization";
      let candidate = base;
      for (let n = 2; taken.has(candidate); n++) candidate = `${base}-${n}`;
      taken.add(candidate);
      await sql`UPDATE organizations SET slug = ${candidate} WHERE id = ${row.id}`;
      orgFilled++;
    }
    console.log(`· organizations: backfilled ${orgFilled} of ${orgs.length}`);

    const propsTaken = new Set<string>();
    const props = await sql<
      { id: string; title: string; city: string; slug: string | null }[]
    >`SELECT id, title, city, slug FROM properties ORDER BY created_at`;
    for (const row of props) if (row.slug) propsTaken.add(row.slug);

    let propFilled = 0;
    for (const row of props) {
      if (row.slug) continue;
      // Titles collide constantly here, so the city is part of the base
      // rather than a numeric suffix nobody can read.
      const base =
        slugify([row.title, row.city].filter(Boolean).join(" ")) || "listing";
      let candidate = base;
      for (let n = 2; propsTaken.has(candidate); n++) candidate = `${base}-${n}`;
      propsTaken.add(candidate);
      await sql`UPDATE properties SET slug = ${candidate} WHERE id = ${row.id}`;
      propFilled++;
    }
    console.log(`· properties: backfilled ${propFilled} of ${props.length}`);

    for (const table of ["organizations", "properties"] as const) {
      await sql`
        CREATE UNIQUE INDEX IF NOT EXISTS ${sql(`${table}_slug_unique`)}
        ON ${sql(table)} (slug)
      `;
      console.log(`· ${table}: unique index present`);
    }

    console.log("\nDone.");
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
