import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";

/**
 * Tiny endpoint the marketing Header calls client-side to know whether to
 * show a sign-in prompt or a link to the signed-in user's portal.
 *
 * Deliberately NOT read server-side in the marketing layout — cookies()
 * there would force every static marketing page (home, /about, /solutions,
 * the audience pages…) into dynamic rendering just to personalize one icon
 * in the header, which is a bad trade given how much of the site is
 * otherwise static-generatable. A route handler is already request-scoped,
 * so reading the session here costs nothing extra.
 */
export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ signedIn: !!user, isAdmin: user?.isAdmin ?? false });
}
