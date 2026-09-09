import { NextResponse } from "next/server";
import { verifyMobileSession } from "@/lib/auth/mobile-session";
import { listInterestsForOrg } from "@/lib/db/queries";

export const runtime = "nodejs";

/**
 * Backs the app's "Interested" screen (landlord/developer only, but not
 * enforced here — any org type just gets an honestly empty list, since
 * listInterestsForOrg is scoped to properties this org actually owns).
 * Only ever what an admin has explicitly flagged — see propertyInterests'
 * doc comment for why the interested org's contact details are never part
 * of this response.
 */
export async function GET(request: Request) {
  const session = await verifyMobileSession(request);
  if (!session || !session.organizationId) {
    return NextResponse.json({ ok: false, error: "Session expired." }, { status: 401 });
  }

  const rows = await listInterestsForOrg(session.organizationId);
  return NextResponse.json({
    ok: true,
    interests: rows.map((r) => ({
      id: r.id,
      note: r.note,
      createdAt: r.createdAt.toISOString(),
      propertyId: r.propertyId,
      propertyTitle: r.propertyTitle,
      propertyCity: r.propertyCity,
      organizationName: r.organizationName,
      organizationType: r.organizationType,
    })),
  });
}
