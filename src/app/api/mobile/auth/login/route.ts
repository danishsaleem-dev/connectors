import { NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/auth/credentials";
import { createHandoffToken } from "@/lib/auth/session";

export const runtime = "nodejs";

/**
 * JSON login for the mobile app — same credential check as the web login
 * Server Action (verifyCredentials), but returns a short-lived handoff
 * token instead of setting a cookie directly: the app has no browser
 * session to set a cookie on. The app hands this token to /portal/handoff
 * in a real browser to actually get signed in there — see session.ts's
 * createHandoffToken doc comment for why that's a separate, short-lived
 * token rather than the long-lived session token itself.
 */
export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const email = String(body.email ?? "");
  const password = String(body.password ?? "");
  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: "Enter your email and password." },
      { status: 400 },
    );
  }

  let user;
  try {
    user = await verifyCredentials(email, password);
  } catch (err) {
    console.error("[mobile] login lookup failed", err);
    return NextResponse.json(
      { ok: false, error: "The portal isn't available right now. Please try again shortly." },
      { status: 503 },
    );
  }
  if (!user) {
    return NextResponse.json({ ok: false, error: "Incorrect email or password." }, { status: 401 });
  }

  const handoffToken = await createHandoffToken({
    userId: user.id,
    isAdmin: user.isAdmin,
    organizationId: user.organizationId,
  });

  return NextResponse.json({
    ok: true,
    name: user.name,
    isAdmin: user.isAdmin,
    handoffToken,
  });
}
