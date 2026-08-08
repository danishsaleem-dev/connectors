import { NextResponse } from "next/server";
import { createAccount } from "@/lib/auth/create-account";
import { createHandoffToken } from "@/lib/auth/session";
import type { OrgType } from "@/lib/db/schema";

export const runtime = "nodejs";

/**
 * JSON registration for the mobile app — same validation and DB writes as
 * the web register Server Action (createAccount), returning a handoff token
 * instead of setting a cookie. New accounts always land on /portal/onboarding,
 * same as a web signup.
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

  const handoffToken = await createHandoffToken({
    userId: result.user.id,
    isAdmin: false,
    organizationId: result.user.organizationId,
  });

  return NextResponse.json({ ok: true, name: result.user.name, isAdmin: false, handoffToken });
}
