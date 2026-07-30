/**
 * Signed session cookie — no session table, no NextAuth. A JSON payload is
 * HMAC-signed with AUTH_SECRET and base64url-encoded; the cookie is just
 * `${payload}.${signature}`, verified by recomputing the signature.
 *
 * Built on the Web Crypto API (globalThis.crypto), not node:crypto, so the
 * exact same code runs in the Edge middleware and in Node server actions
 * without pinning a runtime anywhere.
 */

export const COOKIE_NAME = "connectors_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

/**
 * Deliberately minimal: just enough for the proxy to gate routes without a
 * database round-trip. Anything richer (the organization's type, its
 * onboarding state) is read from the database by the page that needs it, so
 * a stale cookie can never grant access that the record no longer allows.
 */
export type SessionPayload = {
  userId: string;
  isAdmin: boolean;
  organizationId: string | null;
  exp: number;
};

function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET is not set — generate one (e.g. `openssl rand -hex 32`) and add it to .env.local.",
    );
  }
  return secret;
}

function getKey() {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(authSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toBase64Url(bytes: ArrayBuffer) {
  let str = "";
  new Uint8Array(bytes).forEach((b) => (str += String.fromCharCode(b)));
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const padded = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
  const str = atob(padded);
  return Uint8Array.from(str, (c) => c.charCodeAt(0));
}

export async function createSessionToken(payload: Omit<SessionPayload, "exp">) {
  const body: SessionPayload = {
    ...payload,
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
  };
  const encoded = toBase64Url(new TextEncoder().encode(JSON.stringify(body)).buffer as ArrayBuffer);
  const key = await getKey();
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(encoded));
  return `${encoded}.${toBase64Url(signature)}`;
}

export async function verifySessionToken(
  token: string | undefined | null,
): Promise<SessionPayload | null> {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  try {
    const key = await getKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(signature),
      new TextEncoder().encode(encoded),
    );
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(encoded))) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
