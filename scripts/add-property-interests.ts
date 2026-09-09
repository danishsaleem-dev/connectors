/**
 * Creates `property_interests` — an admin-curated "org X is interested in
 * property Y" signal, backing the app's landlord/developer "Interested"
 * screen and Opportunities tab. See schema.ts's doc comment on
 * propertyInterests for why this is its own table rather than reusing
 * property_favorites.
 *
 * Safe to re-run: every statement is IF NOT EXISTS / conditional.
 *
 * Run with:  npx tsx scripts/add-property-interests.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set — check .env.local");

  const sql = postgres(url, { max: 1, prepare: false });
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS property_interests (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        note text,
        created_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE (property_id, organization_id)
      )
    `;
    console.log("· property_interests table present");
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
