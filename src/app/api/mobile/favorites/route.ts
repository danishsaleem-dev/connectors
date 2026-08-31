import { NextResponse } from "next/server";
import { mobileProfileForUserId, verifyMobileSession } from "@/lib/auth/mobile-session";
import { listAllProperties, listFavoritePropertyIds } from "@/lib/db/queries";
import { toMobileLocation } from "@/lib/portal/mobile-location";

export const runtime = "nodejs";

/**
 * The signed-in org's saved locations — backs the app's Saved tab. Same
 * brand-only rule as browsing (see /api/mobile/opportunities/locations's
 * doc comment): only a brand can have favorited anything, since only a
 * brand can see a listing to favorite it in the first place.
 */
export async function GET(request: Request) {
  const session = await verifyMobileSession(request);
  if (!session || !session.organizationId) {
    return NextResponse.json({ ok: false, error: "Session expired." }, { status: 401 });
  }

  const profile = await mobileProfileForUserId(session.userId);
  if (profile?.orgType !== "brand") {
    return NextResponse.json({ ok: false, error: "Saved locations are available to brand accounts." }, { status: 403 });
  }

  const [all, favoriteIds] = await Promise.all([
    listAllProperties(),
    listFavoritePropertyIds(session.organizationId),
  ]);
  const saved = all.filter((p) => favoriteIds.has(p.id));
  const locations = await Promise.all(saved.map((p) => toMobileLocation(p, true)));

  return NextResponse.json({ ok: true, locations });
}
