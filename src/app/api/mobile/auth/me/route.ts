import { NextResponse } from "next/server";
import { mobileProfileForUserId, verifyMobileSession } from "@/lib/auth/mobile-session";

export const runtime = "nodejs";

/**
 * What the app calls on launch with whatever session token it has stored,
 * to find out whether it's still valid before deciding to show Home or
 * Welcome. Deliberately re-reads the user/org from the database rather than
 * trusting anything the token itself carries beyond userId — an org that
 * changed type, or a user that got deactivated, should never be masked by a
 * week-old cached token.
 */
export async function GET(request: Request) {
  const session = await verifyMobileSession(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Session expired." }, { status: 401 });
  }

  const profile = await mobileProfileForUserId(session.userId);
  if (!profile) {
    return NextResponse.json({ ok: false, error: "Account not found." }, { status: 401 });
  }

  return NextResponse.json({ ok: true, ...profile });
}
