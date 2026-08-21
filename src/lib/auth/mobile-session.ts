import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { organizations, users } from "@/lib/db/schema";
import { verifySessionToken, type SessionPayload } from "./session";

/**
 * Reads and verifies the app's bearer session token from a mobile API
 * request — the mobile equivalent of the signed cookie a browser request
 * carries automatically. Same token, same verification (verifySessionToken)
 * as the web session; the only difference is where it travels (an
 * Authorization header instead of a cookie), since a JSON API call has no
 * cookie jar of its own.
 */
export async function verifyMobileSession(request: Request): Promise<SessionPayload | null> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  return verifySessionToken(token);
}

export type MobileProfile = {
  name: string;
  isAdmin: boolean;
  orgType: string | null;
  orgName: string | null;
};

/**
 * The user + org shape the app actually needs — unlike the session token
 * itself (deliberately minimal: just userId/isAdmin/organizationId, so a
 * stale token can never grant more than the current DB record allows), the
 * app needs the org's type and name immediately to pick the right nav tab
 * and personalize Home, so this always does the join rather than trusting
 * anything cached client-side.
 */
export async function mobileProfileFor(user: {
  name: string;
  isAdmin: boolean;
  organizationId: string | null;
}): Promise<MobileProfile> {
  if (!user.organizationId) {
    return { name: user.name, isAdmin: user.isAdmin, orgType: null, orgName: null };
  }
  const db = getDb();
  const [org] = await db
    .select({ type: organizations.type, name: organizations.name })
    .from(organizations)
    .where(eq(organizations.id, user.organizationId))
    .limit(1);
  return {
    name: user.name,
    isAdmin: user.isAdmin,
    orgType: org?.type ?? null,
    orgName: org?.name ?? null,
  };
}

/** Same as mobileProfileFor, but starting from just a userId — what the
 * "check session" endpoint has after verifying a stored token, rather than
 * a full user row already in hand from a fresh login. */
export async function mobileProfileForUserId(userId: string): Promise<MobileProfile | null> {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return null;
  return mobileProfileFor(user);
}
