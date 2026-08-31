import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { propertyFavorites } from "@/lib/db/schema";
import { verifyMobileSession } from "@/lib/auth/mobile-session";

export const runtime = "nodejs";

/**
 * Toggles one property in/out of the org's saved list — same table and
 * the same on/off logic as the website's own toggleFavorite action, just
 * reachable over JSON instead of a form post.
 */
export async function POST(request: Request) {
  const session = await verifyMobileSession(request);
  if (!session || !session.organizationId) {
    return NextResponse.json({ ok: false, error: "Session expired." }, { status: 401 });
  }

  let body: { propertyId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const propertyId = body.propertyId;
  if (!propertyId) {
    return NextResponse.json({ ok: false, error: "Missing location." }, { status: 400 });
  }

  const db = getDb();
  const [existing] = await db
    .select({ id: propertyFavorites.id })
    .from(propertyFavorites)
    .where(
      and(
        eq(propertyFavorites.organizationId, session.organizationId),
        eq(propertyFavorites.propertyId, propertyId),
      ),
    )
    .limit(1);

  if (existing) {
    await db.delete(propertyFavorites).where(eq(propertyFavorites.id, existing.id));
    return NextResponse.json({ ok: true, favorited: false });
  }

  await db.insert(propertyFavorites).values({ organizationId: session.organizationId, propertyId });
  return NextResponse.json({ ok: true, favorited: true });
}
