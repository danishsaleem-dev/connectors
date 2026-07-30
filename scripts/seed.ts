/**
 * Creates (or resets the password of) the first admin account. There's no
 * public signup — every other account is created by an admin from inside
 * the portal — so this script is what gets you in the door the first time.
 *
 * Usage: set SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD / SEED_ADMIN_NAME in
 * .env.local, then `npm run db:seed`.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { hashPassword } from "../src/lib/auth/password";
import { getDb } from "../src/lib/db/client";
import { users } from "../src/lib/db/schema";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "Admin";

  if (!email || !password) {
    console.error(
      "Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env.local first.",
    );
    process.exit(1);
  }

  const db = getDb();
  const passwordHash = await hashPassword(password);

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existing) {
    await db
      .update(users)
      .set({ passwordHash, name, isAdmin: true })
      .where(eq(users.id, existing.id));
    console.log(`Updated existing admin: ${email}`);
  } else {
    await db.insert(users).values({ email, name, isAdmin: true, passwordHash });
    console.log(`Created admin: ${email}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
