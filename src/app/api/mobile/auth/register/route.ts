import { NextResponse } from "next/server";
import { createAccount } from "@/lib/auth/create-account";
import { mobileAuthResponse } from "@/lib/auth/mobile-session";
import type { OrgType } from "@/lib/db/schema";

export const runtime = "nodejs";

/**
 * JSON registration for the mobile app — same validation and DB writes as
 * the web register Server Action (createAccount). Returns both a session
 * token (for the app to store and use on its own future requests) and a
 * handoff token (for getting a browser signed in) — see login/route.ts's
 * doc comment for why those are two different things. New accounts always
 * land on /portal/onboarding once handed off, same as a web signup.
 */
export async function POST(request: Request) {
  let body: {
    type?: string;
    organizationName?: string;
    name?: string;
    email?: string;
    password?: string;
    discipline?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const result = await createAccount({
    type: (body.type ?? "") as OrgType,
    organizationName: String(body.organizationName ?? ""),
    name: String(body.name ?? ""),
    email: String(body.email ?? ""),
    password: String(body.password ?? ""),
    discipline: body.discipline,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json(await mobileAuthResponse(result.user));
}
