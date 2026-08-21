import { NextResponse } from "next/server";
import { verifyMobileSession } from "@/lib/auth/mobile-session";
import { createHandoffToken } from "@/lib/auth/session";

export const runtime = "nodejs";

/**
 * Mints a fresh handoff token for an already-signed-in app session.
 *
 * Login/register only hand back a handoff token once, at that moment — it's
 * good for 120 seconds by design (see session.ts). That's fine right after
 * signing in, but once a session is *restored* from storage on a later app
 * launch, there's no still-valid token left to open the portal with. This
 * is what "Open the portal" calls at the moment it's actually tapped,
 * rather than the app trying to hold onto one from login time.
 */
export async function POST(request: Request) {
  const session = await verifyMobileSession(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Session expired." }, { status: 401 });
  }

  const handoffToken = await createHandoffToken({
    userId: session.userId,
    isAdmin: session.isAdmin,
    organizationId: session.organizationId,
  });

  return NextResponse.json({ ok: true, handoffToken });
}
