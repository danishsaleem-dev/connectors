import { NextResponse } from "next/server";
import { createAccount } from "@/lib/auth/create-account";
import { mobileAuthResponse } from "@/lib/auth/mobile-session";
import { verifyOAuthSignupToken } from "@/lib/auth/session";
import type { OrgType } from "@/lib/db/schema";

export const runtime = "nodejs";

/**
 * Finishes a first-time Google/Apple signup, once the app has collected the
 * two things a provider can't tell us: the account type and the company
 * name (see ../route.ts for why this is a second step).
 *
 * The identity comes from `pendingToken` — signed by us minutes earlier
 * after verifying the provider's ID token — and never from the request
 * body. That's the whole point of the token: if the app could post its own
 * email here, anyone could create an account as anyone.
 */
export async function POST(request: Request) {
  let body: {
    pendingToken?: string;
    type?: string;
    organizationName?: string;
    name?: string;
    discipline?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const pending = await verifyOAuthSignupToken(body.pendingToken);
  if (!pending) {
    return NextResponse.json(
      { ok: false, error: "That sign-in expired. Please try again." },
      { status: 401 },
    );
  }

  const result = await createAccount({
    type: (body.type ?? "") as OrgType,
    organizationName: String(body.organizationName ?? ""),
    // The provider's name is the default, but an editable one — Apple sends
    // it only on first authorization and some accounts have no name at all,
    // so the app can pass a typed-in replacement.
    name: String(body.name ?? pending.name ?? ""),
    email: pending.email,
    provider: { name: pending.provider, subject: pending.subject },
    discipline: body.discipline,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json(await mobileAuthResponse(result.user));
}
