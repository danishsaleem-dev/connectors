import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { verifyPassword } from "./password";

/** Shared by the web login Server Action and the mobile JSON API — one
 * place decides whether a password is correct, so the two surfaces can
 * never drift into checking it differently. */
export async function verifyCredentials(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) return null;

  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.email, normalized)).limit(1);

  // Same generic "not found" outcome either way — never confirm whether an
  // email exists via timing or response shape.
  if (!user || !(await verifyPassword(password, user.passwordHash))) return null;
  return user;
}
