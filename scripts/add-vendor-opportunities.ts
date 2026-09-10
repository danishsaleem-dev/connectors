/**
 * Creates `vendor_opportunities` — free-form work briefs an admin hands to
 * one vendor (Partners Program member) at a time, backing the app's vendor
 * Opportunities tab. See schema.ts's doc comment on vendorOpportunities for
 * why this is free-form rather than tied to a property or brand request.
 *
 * Safe to re-run: every statement is IF NOT EXISTS / conditional.
 *
 * Run with:  npx tsx scripts/add-vendor-opportunities.ts
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
      CREATE TABLE IF NOT EXISTS vendor_opportunities (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        title text NOT NULL,
        description text,
        attachment_path text,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `;
    console.log("· vendor_opportunities table present");
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
