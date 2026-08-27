import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { messages, users } from "@/lib/db/schema";
import { verifyMobileSession } from "@/lib/auth/mobile-session";

export const runtime = "nodejs";

/**
 * The organization's one thread with the Connectors team — same table and
 * the same "every conversation has Connectors on one side of it" rule as
 * the website's own /portal/messages (see actions.ts's postMessage). There
 * is no org-to-org thread, and no admin access here: an admin replies from
 * the website, which is where they pick which organization they're
 * replying to; the app only ever has one organization in scope, its own.
 */
export async function GET(request: Request) {
  const session = await verifyMobileSession(request);
  if (!session || !session.organizationId) {
    return NextResponse.json({ ok: false, error: "Session expired." }, { status: 401 });
  }

  const thread = await getDb()
    .select()
    .from(messages)
    .where(eq(messages.organizationId, session.organizationId))
    .orderBy(asc(messages.createdAt));

  return NextResponse.json({ ok: true, messages: thread });
}

export async function POST(request: Request) {
  const session = await verifyMobileSession(request);
  if (!session || !session.organizationId) {
    return NextResponse.json({ ok: false, error: "Session expired." }, { status: 401 });
  }

  let body: { body?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const text = (body.body ?? "").trim();
  if (text.length < 2) {
    return NextResponse.json({ ok: false, error: "Write a message first." }, { status: 400 });
  }

  const [user] = await getDb()
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  await getDb().insert(messages).values({
    organizationId: session.organizationId,
    authorName: user?.name ?? "You",
    authorIsAdmin: false,
    body: text,
  });
  revalidatePath("/portal", "layout");

  return NextResponse.json({ ok: true });
}
