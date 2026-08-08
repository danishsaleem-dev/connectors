import { NextResponse, type NextRequest } from "next/server";
import { setSessionCookie, verifyHandoffToken } from "@/lib/auth/session";

export const runtime = "nodejs";

/**
 * Where the mobile app's sign-in actually becomes a browser session. The
 * app authenticates over /api/mobile/auth/*, gets back a short-lived
 * handoff token, and opens `${site}/portal/handoff?token=...` in a real
 * browser — this route verifies that token, sets the normal 7-day session
 * cookie, and sends the browser on to the same place web login redirects
 * to. No app-side dashboard needed: from here it's the exact same portal
 * every web user lands in, gated by the exact same requireAdmin/
 * requireParticipant checks.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const payload = await verifyHandoffToken(token);

  if (!payload) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "?auth=login&handoff=expired";
    return NextResponse.redirect(url);
  }

  await setSessionCookie({
    userId: payload.userId,
    isAdmin: payload.isAdmin,
    organizationId: payload.organizationId,
  });

  const url = request.nextUrl.clone();
  url.pathname = payload.isAdmin ? "/portal/admin" : "/portal";
  url.search = "";
  return NextResponse.redirect(url);
}
