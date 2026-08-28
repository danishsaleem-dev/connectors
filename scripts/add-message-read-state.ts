/**
 * Adds `read_at` to `messages` — nullable, no default, so every existing
 * message starts unread rather than guessing at history. This is what
 * backs the app's Notifications tab: an admin-authored message with no
 * read_at is an unread notification; marking the thread read (opening the
 * Messages tab) sets it on every admin message in that org's thread at
 * once. Org-authored messages never get a read_at — there's no "unread to
 * yourself" state to track.
 *
 * Deliberately additive — safe to re-run: ADD COLUMN IF NOT EXISTS touches
 * no existing data.
 *
 * Run with:  npx tsx scripts/add-message-read-state.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set — check .env.local");

  const sql = postgres(url, { max: 1, prepare: false });
  try {
    await sql`ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at timestamptz`;
    console.log("· messages: read_at column present");
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
