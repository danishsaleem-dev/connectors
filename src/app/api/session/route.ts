import { NextResponse } from "next/server";
import { getCurrentContext } from "@/lib/auth/current-user";

/**
 * Tiny endpoint the marketing Header calls client-side to know whether to
 * show a sign-in prompt or the signed-in account's dropdown (dashboard
 * link, profile, sign out) — and which of those to show, based on role.
 *
 * Deliberately NOT read server-side in the marketing layout — cookies()
 * there would force every static marketing page (home, /about, /solutions,
 * the audience pages…) into dynamic rendering just to personalize one icon
 * in the header, which is a bad trade given how much of the site is
 * otherwise static-generatable. A route handler is already request-scoped,
 * so reading the session here costs nothing extra.
 */
export async function GET() {
  const context = await getCurrentContext();
  if (!context) {
    return NextResponse.json({ signedIn: false, isAdmin: false, name: null, orgType: null });
  }
  return NextResponse.json({
    signedIn: true,
    isAdmin: context.user.isAdmin,
    name: context.user.name,
    orgType: context.organization?.type ?? null,
  });
}
