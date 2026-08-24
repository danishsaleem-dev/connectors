import { NextResponse } from "next/server";
import { mobileProfileForUserId, verifyMobileSession } from "@/lib/auth/mobile-session";
import { listAllProperties } from "@/lib/db/queries";
import { resolveMediaUrls } from "@/lib/storage/media";

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

  const all = await listAllProperties();
  const pool = all.filter((p) => p.status !== "withdrawn");
  const locations = await Promise.all(
    pool.map(async (p) => ({
      id: p.id,
      title: p.title,
      propertyType: p.propertyType,
      city: p.city,
      country: p.country,
      area: p.area,
      sizeSqft: p.sizeSqft,
      dimensions: p.dimensions,
      floorLevel: p.floorLevel,
      parkingAvailable: p.parkingAvailable,
      rentAmount: p.rentAmount,
      rentPeriod: p.rentPeriod,
      currency: p.currency,
      availableFrom: p.availableFrom,
      status: p.status,
      featured: p.featured,
      description: p.description,
      video: p.video,
      organizationName: p.organizationName,
      photoUrls: await resolveMediaUrls(p.photos ?? []),
    })),
  );

  return NextResponse.json({ ok: true, locations });
}
