import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { organizations, users } from "@/lib/db/schema";
import { COOKIE_NAME, verifySessionToken } from "./session";

export async function getSession() {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value);
}

/** Redundant with the proxy guard by design — every data-access path checks
 * for itself rather than trusting the request already passed through it. */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  return user ?? null;
}

/** The user plus their organization, which is what most portal pages need. */
export async function getCurrentContext() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!user.organizationId) return { user, organization: null };

  const [organization] = await getDb()
    .select()
    .from(organizations)
    .where(eq(organizations.id, user.organizationId))
    .limit(1);

  return { user, organization: organization ?? null };
}

/** Guard for admin-only pages. Redirects rather than throwing so a
 * mis-navigated participant lands somewhere useful. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/portal/login");
  if (!user.isAdmin) redirect("/portal");
  return user;
}

/**
 * Guard for participant pages. Also enforces the onboarding gate: an
 * organization that hasn't finished its profile can't reach anything except
 * the wizard itself.
 */
export async function requireParticipant({ allowOnboarding = false } = {}) {
  const context = await getCurrentContext();
  if (!context) redirect("/portal/login");
  if (context.user.isAdmin) redirect("/portal/admin");
  if (!context.organization) redirect("/portal/login");

  if (!allowOnboarding && !context.organization.onboardingCompletedAt) {
    redirect("/portal/onboarding");
  }

  return { user: context.user, organization: context.organization };
}
