import { NextResponse } from "next/server";
import { verifyMobileSession } from "@/lib/auth/mobile-session";
import { getOrgAnalytics } from "@/lib/db/queries";

export const runtime = "nodejs";

/** Backs the app's Analytics screen. See getOrgAnalytics's doc comment for
 * why this only returns message-activity and favorites data — nothing else
 * in the product is instrumented yet. */
export async function GET(request: Request) {
  const session = await verifyMobileSession(request);
  if (!session || !session.organizationId) {
    return NextResponse.json({ ok: false, error: "Session expired." }, { status: 401 });
  }

  const analytics = await getOrgAnalytics(session.organizationId);
  return NextResponse.json({ ok: true, analytics });
}
