/**
 * Adds `photo_url` to franchisee/landlord/developer/investor profiles —
 * brand, vendor and consultant already had an equivalent (logoUrl/logoUrl/
 * photoUrl); these four didn't, so their account had nothing to point the
 * app's own profile-photo picker at. Nullable, no default, so every
 * existing account starts with no photo rather than guessing at one.
 *
 * Deliberately additive — safe to re-run: ADD COLUMN IF NOT EXISTS touches
 * no existing data.
 *
 * Run with:  npx tsx scripts/add-profile-photos.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set — check .env.local");

  const sql = postgres(url, { max: 1, prepare: false });
  try {
    await sql`ALTER TABLE franchisee_profiles ADD COLUMN IF NOT EXISTS photo_url text`;
    await sql`ALTER TABLE landlord_profiles ADD COLUMN IF NOT EXISTS photo_url text`;
    await sql`ALTER TABLE developer_profiles ADD COLUMN IF NOT EXISTS photo_url text`;
    await sql`ALTER TABLE investor_profiles ADD COLUMN IF NOT EXISTS photo_url text`;
    console.log("· franchisee/landlord/developer/investor profiles: photo_url column present");
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
