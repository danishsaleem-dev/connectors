import "server-only";
import { getCurrentUser } from "@/lib/auth/current-user";

/**
 * Shared by every mutation in lib/portal/*.ts. Not itself a Server Action —
 * kept out of actions.ts (which has a top-level "use server" directive that
 * would otherwise turn this internal guard into a callable action) so it can
 * be imported from any server-only module, including enquiry-convert.ts.
 */
export async function requireAdminUser() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) throw new Error("Admin access required.");
  return user;
}

export async function requireOrgUser() {
  const user = await getCurrentUser();
  if (!user || user.isAdmin || !user.organizationId) {
    throw new Error("Participant access required.");
  }
  return user as typeof user & { organizationId: string };
}
