import { NextResponse } from "next/server";
import { listFranchisingBrands } from "@/lib/db/queries";
import { verifyMobileSession } from "@/lib/auth/mobile-session";
import { resolveMediaUrl } from "@/lib/storage/media";

export const runtime = "nodejs";

/**
 * Brands actively franchising — the app's "Brands" and "Franchise
 * Opportunities" Opportunities categories both read this. Not new exposure:
 * it's the exact same query and the exact same fields the public
 * /for-franchise marketing page already renders to anonymous visitors (see
 * FranchisingBrandsSection) — only franchising, active organizations, never
 * anything private about them. Requiring a session here is just consistency
 * with every other mobile route, not an actual access restriction on the
 * data itself.
 */
export async function GET(request: Request) {
  const session = await verifyMobileSession(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Session expired." }, { status: 401 });
  }

  const rows = await listFranchisingBrands();
  const brands = await Promise.all(
    rows.map(async (b) => ({ ...b, logoUrl: await resolveMediaUrl(b.logoUrl) })),
  );

  return NextResponse.json({ ok: true, brands });
}
