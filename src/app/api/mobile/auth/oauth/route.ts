import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { mobileAuthResponse } from "@/lib/auth/mobile-session";
import { verifyIdToken, type OAuthProvider } from "@/lib/auth/oauth";
import { createOAuthSignupToken } from "@/lib/auth/session";

export const runtime = "nodejs";

/**
 * Google / Apple sign-in for the app.
 *
 * The app performs the native sign-in itself and posts the resulting ID
 * token here; this verifies it against the provider's own signing keys
 * (see oauth.ts) and only then trusts the email inside it. Nothing the app
 * claims about who someone is is taken at face value.
 *
 * Two outcomes:
 *  - The verified email already has an account → signed in, same response
 *    shape as password login.
 *  - It doesn't → nothing is created yet. A provider knows an email and a
 *    name, but not whether this is a brand, a landlord or an investor, or
 *    what their company is called, and an organization can't exist without
 *    those. So this returns `needsSignup` plus a short-lived signed token
 *    carrying the verified identity, and the app collects the rest and
 *    calls ./complete.
 *
 * Matching is on the provider's *verified* email (oauth.ts rejects the
 * token otherwise), which is what makes it safe to sign into an account
 * that was originally created with a password: proving control of the
 * address is the same bar a password reset would clear.
 */
export async function POST(request: Request) {
  let body: { provider?: string; idToken?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const provider = body.provider === "google" || body.provider === "apple" ? body.provider : null;
  const idToken = String(body.idToken ?? "");
  if (!provider || !idToken) {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const verified = await verifyIdToken(provider as OAuthProvider, idToken);
  if (!verified.ok) {
    return NextResponse.json(
      { ok: false, error: verified.error },
      { status: verified.status },
    );
  }
  const { email, name, subject } = verified.identity;

  let existing;
  try {
    const db = getDb();
    [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  } catch (err) {
    console.error("[mobile] oauth lookup failed", err);
    return NextResponse.json(
      { ok: false, error: "The portal isn't available right now. Please try again shortly." },
      { status: 503 },
    );
  }

  if (!existing) {
    const pendingToken = await createOAuthSignupToken({ provider, subject, email, name });
    return NextResponse.json({
      ok: true,
      needsSignup: true,
      pendingToken,
      email,
      // Pre-fills the name field on the account-type step. Apple only ever
      // sends a name on the very first authorization, which is exactly the
      // moment this branch runs — so it's now or never.
      name,
    });
  }

  // Records which provider was used on an account that had never signed in
  // this way before, including one originally created with a password. The
  // password (if any) deliberately stays put: this links a second way in,
  // it doesn't take the first one away.
  if (existing.authProvider !== provider || existing.providerSubject !== subject) {
    try {
      await getDb()
        .update(users)
        .set({ authProvider: provider, providerSubject: subject })
        .where(eq(users.id, existing.id));
    } catch (err) {
      // Non-fatal: the sign-in itself is already valid, and this is only a
      // record of how it happened.
      console.error("[mobile] oauth provider link failed", err);
    }
  }

  return NextResponse.json(await mobileAuthResponse(existing));
}
