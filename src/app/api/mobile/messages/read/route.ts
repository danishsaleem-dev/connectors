import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { messages } from "@/lib/db/schema";
import { verifyMobileSession } from "@/lib/auth/mobile-session";

export const runtime = "nodejs";

/**
 * Marks every admin-authored message in the org's thread as read — the
 * whole thread at once, not one at a time, matching how opening a
 * conversation works everywhere else (see messages.readAt's doc comment
 * on schema.ts). Called when the app's Messages tab opens.
 */
export async function POST(request: Request) {
  const session = await verifyMobileSession(request);
  if (!session || !session.organizationId) {
    return NextResponse.json({ ok: false, error: "Session expired." }, { status: 401 });
  }

  await getDb()
    .update(messages)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(messages.organizationId, session.organizationId),
        eq(messages.authorIsAdmin, true),
        isNull(messages.readAt),
      ),
    );

  return NextResponse.json({ ok: true });
}
