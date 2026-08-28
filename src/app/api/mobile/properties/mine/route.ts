import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { organizations, properties } from "@/lib/db/schema";
import { verifyMobileSession } from "@/lib/auth/mobile-session";
import { resolveMediaUrls } from "@/lib/storage/media";
import { orgTypeMeta } from "@/lib/portal/domain";

export const runtime = "nodejs";

/**
 * An org's own listed properties — for landlords/developers to see what
 * they've submitted, not the brand-only marketplace browse (see
 * /api/mobile/opportunities/locations's doc comment for that one). Gated
 * on orgTypeMeta(type).listsProperties rather than a hardcoded type check,
 * same flag the website's own /portal/properties page reads — landlord
 * and developer both list space today, and this stays correct if that
 * set ever changes without needing to touch this route.
 *
 * Same response shape as /api/mobile/opportunities/locations (the app's
 * Location model reads either one), scoped to the caller's own
 * organizationId instead of every listing — mirrors the website's own
 * /portal/properties query exactly.
 */
export async function GET(request: Request) {
  const session = await verifyMobileSession(request);
  if (!session || !session.organizationId) {
    return NextResponse.json({ ok: false, error: "Session expired." }, { status: 401 });
  }

  const [org] = await getDb()
    .select()
    .from(organizations)
    .where(eq(organizations.id, session.organizationId))
    .limit(1);
  if (!org || !orgTypeMeta(org.type).listsProperties) {
    return NextResponse.json(
      { ok: false, error: "This account doesn't list properties." },
      { status: 403 },
    );
  }

  const rows = await getDb()
    .select()
    .from(properties)
    .where(eq(properties.organizationId, org.id))
    .orderBy(desc(properties.createdAt));

  const locations = await Promise.all(
    rows.map(async (p) => ({
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
      organizationName: org.name,
      photoUrls: await resolveMediaUrls(p.photos ?? []),
    })),
  );

  return NextResponse.json({ ok: true, locations });
}
