import { NextResponse } from "next/server";
import { verifyMobileSession } from "@/lib/auth/mobile-session";
import { listMatchedFranchiseOpportunitiesForOrg } from "@/lib/db/queries";

export const runtime = "nodejs";

/**
 * Backs the app's Opportunities tab (franchisee role only, but not
 * enforced here — any other org type just gets an honestly empty list,
 * since the query is scoped to franchise_opportunity_interests rows owned
 * by this org). A franchisee never browses franchise_opportunities or
 * brands directly (see franchiseOpportunityInterests' doc comment) — only
 * what an admin has matched to them.
 */
export async function GET(request: Request) {
  const session = await verifyMobileSession(request);
  if (!session || !session.organizationId) {
    return NextResponse.json({ ok: false, error: "Session expired." }, { status: 401 });
  }

  const rows = await listMatchedFranchiseOpportunitiesForOrg(session.organizationId);
  return NextResponse.json({
    ok: true,
    opportunities: rows.map((r) => ({
      id: r.id,
      opportunityId: r.opportunityId,
      title: r.title,
      brandName: r.brandName,
      city: r.city,
      country: r.country,
      territory: r.territory,
      investmentMin: r.investmentMin,
      investmentMax: r.investmentMax,
      currency: r.currency,
      spaceRequiredSqft: r.spaceRequiredSqft,
      status: r.status,
      description: r.description,
      note: r.note,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}
