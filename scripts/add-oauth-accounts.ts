/**
 * Makes `users` able to hold an account that signed up through Google or
 * Apple rather than with a password.
 *
 * Two changes:
 *  - `password_hash` becomes nullable. An OAuth account has no password at
 *    all, and storing a random unusable one instead would leave rows that
 *    look password-capable to every other query in the codebase.
 *  - `auth_provider` / `provider_subject` record which provider vouched for
 *    the account and that provider's own stable user id (the `sub` claim).
 *    Sign-in still matches on the verified email — these are for audit, and
 *    for telling a password account apart from an OAuth one when deciding
 *    what to show on the account screen.
 *
 * Deliberately additive and safe to re-run: existing password accounts keep
 * their hash and get nulls in the two new columns.
 *
 * Run with:  npx tsx scripts/add-oauth-accounts.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set — check .env.local");

  const sql = postgres(url, { max: 1, prepare: false });
  try {
    await sql`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL`;
    console.log("· users: password_hash is nullable");

    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider text`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_subject text`;
    console.log("· users: auth_provider / provider_subject present");
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
