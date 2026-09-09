/**
 * Adds "released" to consultant_inquiry_status — the status an admin sets
 * to make an inquiry visible to the consultant it's about, via the app's
 * new "Requests" tab. See schema.ts's doc comment on
 * consultantInquiryStatusEnum for the full rule.
 *
 * ALTER TYPE ... ADD VALUE can't run inside a transaction in Postgres, and
 * IF NOT EXISTS makes re-running this safe either way.
 *
 * Run with:  npx tsx scripts/add-consultant-inquiry-released-status.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set — check .env.local");

  const sql = postgres(url, { max: 1, prepare: false });
  try {
    await sql`ALTER TYPE consultant_inquiry_status ADD VALUE IF NOT EXISTS 'released'`;
    console.log("· consultant_inquiry_status: 'released' value present");
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
