import { NextResponse } from "next/server";
import { verifyMobileSession } from "@/lib/auth/mobile-session";
import { listVendorOpportunities } from "@/lib/db/queries";
import { resolveMediaUrl } from "@/lib/storage/media";

export const runtime = "nodejs";

/**
 * Backs the app's Opportunities tab (vendor role only, but not enforced
 * here — any other org type just gets an honestly empty list, since the
 * query is scoped to vendor_opportunities rows owned by this org). A
 * vendor never browses brands/franchisees/properties the way every other
 * role does (see orgTypeMeta's browsesProperties: false) — these
 * admin-authored briefs are the entire feed.
 */
export async function GET(request: Request) {
  const session = await verifyMobileSession(request);
  if (!session || !session.organizationId) {
    return NextResponse.json({ ok: false, error: "Session expired." }, { status: 401 });
  }

  const rows = await listVendorOpportunities(session.organizationId);
  const opportunities = await Promise.all(
    rows.map(async (r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      attachmentUrl: r.attachmentPath ? await resolveMediaUrl(r.attachmentPath) : null,
      createdAt: r.createdAt.toISOString(),
    })),
  );

  return NextResponse.json({ ok: true, opportunities });
}
