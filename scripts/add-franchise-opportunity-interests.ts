/**
 * Creates `franchise_opportunity_interests` — an admin-curated "this
 * franchisee is a match for that opportunity" signal, backing the app's
 * franchisee Opportunities tab. See schema.ts's doc comment on
 * franchiseOpportunityInterests for why this mirrors propertyInterests.
 *
 * Safe to re-run: every statement is IF NOT EXISTS / conditional.
 *
 * Run with:  npx tsx scripts/add-franchise-opportunity-interests.ts
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
      CREATE TABLE IF NOT EXISTS franchise_opportunity_interests (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        franchise_opportunity_id uuid NOT NULL REFERENCES franchise_opportunities(id) ON DELETE CASCADE,
        organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        note text,
        created_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE (franchise_opportunity_id, organization_id)
      )
    `;
    console.log("· franchise_opportunity_interests table present");
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
