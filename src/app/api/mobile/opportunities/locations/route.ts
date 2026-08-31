import { NextResponse } from "next/server";
import { mobileProfileForUserId, verifyMobileSession } from "@/lib/auth/mobile-session";
import { listAllProperties, listFavoritePropertyIds } from "@/lib/db/queries";
import { toMobileLocation } from "@/lib/portal/mobile-location";

export const runtime = "nodejs";

/**
 * Read-only browse endpoint for the app's "Browse Available Locations"
 * screen — same data and the same access rule the website's own
 * /available-locations page already enforces: full listing details are
 * brand-only (see LocationCard's doc comment on the website), everyone
 * else gets a locked teaser there rather than the gated content itself.
 * The app has no teaser UI to show a non-brand viewer, so this endpoint
 * just requires a brand session outright rather than returning a partial
 * shape nothing consumes yet.
 *
 * Mirrors available-locations/page.tsx's own logic exactly: the same
 * listAllProperties() query, the same "not withdrawn" filter applied in
 * code rather than SQL, and the same per-listing resolveMediaUrls call to
 * exchange each private Storage path for a short-lived signed URL before
 * this ever leaves the server as JSON.
 *
 * Deliberately doesn't return organizationName (or anything else that
 * identifies the landlord) — no party in the portal contacts another
 * directly, only through Connectors, so a browsing brand never learns who
 * owns a listing before an admin facilitates that. The website's own
 * LocationCard never carries this field either (see LocationCardData);
 * this used to include it and that was a real gap, not a design choice.
 */
export async function GET(request: Request) {
  const session = await verifyMobileSession(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Session expired." }, { status: 401 });
  }

  const profile = await mobileProfileForUserId(session.userId);
  if (profile?.orgType !== "brand") {
    return NextResponse.json(
      { ok: false, error: "Browsing locations is available to brand accounts." },
      { status: 403 },
    );
  }

  const [all, favoriteIds] = await Promise.all([
    listAllProperties(),
    listFavoritePropertyIds(session.organizationId!),
  ]);
  const pool = all.filter((p) => p.status !== "withdrawn");
  const locations = await Promise.all(pool.map((p) => toMobileLocation(p, favoriteIds.has(p.id))));

  return NextResponse.json({ ok: true, locations });
}
