import "server-only";
import { createRemoteJWKSet, jwtVerify } from "jose";

/**
 * Verifies the ID token a native Google or Apple sign-in hands back to the
 * app, so the server never takes the app's word for who someone is.
 *
 * The app can't be trusted with identity: anything it posts (an email, a
 * name, a "signed in as" flag) is attacker-controlled — an APK can be
 * decompiled and its requests replayed. What it *can* do is forward the
 * provider's ID token, a JWT signed by Google/Apple. This checks that
 * signature against the provider's published keys, along with the issuer,
 * the audience (our own client IDs), expiry, and that the email is verified.
 * Only then does the caller learn an identity.
 *
 * Verification uses `jose` rather than hand-rolled Web Crypto: this is
 * exactly the code where a subtle mistake (skipping `aud`, accepting `alg:
 * none`, mis-parsing JWKS) is a full authentication bypass, so it belongs
 * in an audited library even though the rest of this codebase's token
 * handling is deliberately dependency-free.
 */

export type OAuthProvider = "google" | "apple";

export type VerifiedIdentity = {
  provider: OAuthProvider;
  /** The provider's own stable id for this user (the `sub` claim). */
  subject: string;
  email: string;
  /** Google returns this on every sign-in; Apple only on the very first
   * authorization, and never again — so the caller must persist it then. */
  name: string | null;
};

const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];
const APPLE_ISSUER = "https://appleid.apple.com";

const googleKeys = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
const appleKeys = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));

/**
 * Every client id that may legitimately appear in a token's `aud`.
 *
 * Google issues a *different* client id per platform (Android, iOS, web),
 * and the token's audience is whichever one performed the sign-in, so all
 * of them have to be accepted — while still rejecting a token minted for
 * some unrelated app, which is the whole point of checking `aud` at all.
 * Comma-separated in one env var so adding a platform is a config change.
 */
function audiencesFor(provider: OAuthProvider): string[] {
  const raw =
    provider === "google"
      ? process.env.GOOGLE_OAUTH_CLIENT_IDS
      : process.env.APPLE_OAUTH_CLIENT_IDS;
  return (raw ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function isProviderConfigured(provider: OAuthProvider) {
  return audiencesFor(provider).length > 0;
}

export type VerifyResult =
  | { ok: true; identity: VerifiedIdentity }
  | { ok: false; error: string; status: number };

export async function verifyIdToken(
  provider: OAuthProvider,
  idToken: string,
): Promise<VerifyResult> {
  const audience = audiencesFor(provider);
  if (audience.length === 0) {
    // Not the user's fault and not a credential problem — the deployment is
    // missing GOOGLE_OAUTH_CLIENT_IDS / APPLE_OAUTH_CLIENT_IDS, so say so
    // as a server error rather than a sign-in failure.
    return {
      ok: false,
      status: 503,
      error: `${provider === "google" ? "Google" : "Apple"} sign-in isn't configured yet.`,
    };
  }

  let payload;
  try {
    const verified = await jwtVerify(
      idToken,
      provider === "google" ? googleKeys : appleKeys,
      {
        issuer: provider === "google" ? GOOGLE_ISSUERS : APPLE_ISSUER,
        audience,
      },
    );
    payload = verified.payload;
  } catch {
    // Covers a bad signature, a wrong/foreign audience, an expired token
    // and a malformed one alike — all of them mean the same thing to the
    // caller, and distinguishing them here would only help an attacker.
    return { ok: false, status: 401, error: "That sign-in couldn't be verified. Please try again." };
  }

  const subject = typeof payload.sub === "string" ? payload.sub : null;
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : null;
  // Both providers send this as a real boolean or the string "true"
  // depending on the flow, so normalize rather than compare to `true`.
  const emailVerified = payload.email_verified === true || payload.email_verified === "true";

  if (!subject || !email) {
    return { ok: false, status: 401, error: "That account didn't share an email address." };
  }
  if (!emailVerified) {
    // Matching on an unverified email would let someone claim an address
    // they don't control and take over the existing account that uses it.
    return { ok: false, status: 401, error: "That account's email address isn't verified." };
  }

  const name = typeof payload.name === "string" && payload.name.trim() ? payload.name.trim() : null;

  return { ok: true, identity: { provider, subject, email, name } };
}
