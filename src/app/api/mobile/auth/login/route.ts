import { NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/auth/credentials";
import { mobileProfileFor } from "@/lib/auth/mobile-session";
import { createHandoffToken, createSessionToken } from "@/lib/auth/session";

export const runtime = "nodejs";

/**
 * JSON login for the mobile app — same credential check as the web login
 * Server Action (verifyCredentials). Returns two different tokens for two
 * different jobs: `sessionToken` is the same signed token the web session
 * cookie carries, for the app to store and send back as a Bearer header on
 * its own future requests (see mobile-session.ts); `handoffToken` is a
 * separate, short-lived, single-purpose token the app hands to
 * /portal/handoff to get a *browser* signed in — see session.ts's
 * createHandoffToken doc comment for why that can't just be the session
 * token itself.
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

  const [handoffToken, sessionToken, profile] = await Promise.all([
    createHandoffToken({
      userId: user.id,
      isAdmin: user.isAdmin,
      organizationId: user.organizationId,
    }),
    createSessionToken({
      userId: user.id,
      isAdmin: user.isAdmin,
      organizationId: user.organizationId,
    }),
    mobileProfileFor(user),
  ]);

  return NextResponse.json({
    ok: true,
    name: profile.name,
    isAdmin: profile.isAdmin,
    orgType: profile.orgType,
    orgName: profile.orgName,
    handoffToken,
    sessionToken,
  });
}
