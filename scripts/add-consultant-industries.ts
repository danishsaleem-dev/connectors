/**
 * Adds `industries` to `consultants` — a plain text[] of industry category
 * labels ("Food & Beverage", "Retail"), distinct from the existing
 * `expertise` jsonb column, which holds skill/competency tags ("Financial
 * Management") rather than industries. Nullable, no default, so every
 * existing consultant starts untagged rather than guessing at a category.
 *
 * Deliberately additive — safe to re-run: ADD COLUMN IF NOT EXISTS touches
 * no existing data.
 *
 * Run with:  npx tsx scripts/add-consultant-industries.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set — check .env.local");

  const sql = postgres(url, { max: 1, prepare: false });
  try {
    await sql`ALTER TABLE consultants ADD COLUMN IF NOT EXISTS industries text[]`;
    console.log("· consultants: industries column present");
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
