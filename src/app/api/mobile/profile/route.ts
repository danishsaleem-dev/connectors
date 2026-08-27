import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { organizations } from "@/lib/db/schema";
import { getProfile } from "@/lib/db/queries";
import { writeProfile } from "@/lib/portal/actions";
import { verifyMobileSession } from "@/lib/auth/mobile-session";

export const runtime = "nodejs";

/**
 * Read/write the signed-in organization's profile — the same per-type
 * tables and the same writeProfile reader the website's onboarding wizard
 * and Edit Profile page use (see actions.ts's completeOnboarding/
 * saveProfile), exposed as JSON for the app instead of a form post.
 *
 * GET returns the org's core fields plus its type-specific profile row, so
 * the app's completion flow can prefill with whatever was already saved —
 * from a previous app session, or the website itself. POST accepts a
 * partial set of fields; every call saves progress, `complete: true` also
 * flips onboardingCompletedAt, mirroring completeOnboarding.
 *
 * Admins have no organization, so both methods 401 for them the same way
 * they would for an expired session — there's nothing here for them to
 * read or write.
 */
async function requireOrg(request: Request) {
  const session = await verifyMobileSession(request);
  if (!session || !session.organizationId) return null;
  const [org] = await getDb()
    .select()
    .from(organizations)
    .where(eq(organizations.id, session.organizationId))
    .limit(1);
  return org ?? null;
}

export async function GET(request: Request) {
  const org = await requireOrg(request);
  if (!org) {
    return NextResponse.json({ ok: false, error: "Session expired." }, { status: 401 });
  }

  const profile = await getProfile(org.type, org.id);
  return NextResponse.json({
    ok: true,
    orgType: org.type,
    organization: {
      name: org.name,
      phone: org.phone,
      country: org.country,
      onboardingCompletedAt: org.onboardingCompletedAt?.toISOString() ?? null,
    },
    profile: profile ?? {},
  });
}

export async function POST(request: Request) {
  const org = await requireOrg(request);
  if (!org) {
    return NextResponse.json({ ok: false, error: "Session expired." }, { status: 401 });
  }

  let body: {
    organizationName?: string;
    phone?: string;
    country?: string;
    complete?: boolean;
    fields?: Record<string, unknown>;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Built into a FormData rather than read directly, so writeProfile's own
  // str/num/bool/list parsing runs unchanged — in particular, a checkbox is
  // "on" only when the key is present at all (form semantics), so a false
  // value must be left off entirely rather than appended as the string
  // "false", which bool() would otherwise read as checked.
  const formData = new FormData();
  for (const [key, value] of Object.entries(body.fields ?? {})) {
    if (value == null) continue;
    if (typeof value === "boolean") {
      if (value) formData.set(key, "on");
    } else if (Array.isArray(value)) {
      for (const item of value) formData.append(key, String(item));
    } else {
      formData.set(key, String(value));
    }
  }

  await getDb()
    .update(organizations)
    .set({
      ...(body.organizationName ? { name: body.organizationName } : {}),
      ...(body.phone ? { phone: body.phone } : {}),
      ...(body.country ? { country: body.country } : {}),
      ...(body.complete ? { onboardingCompletedAt: new Date(), status: "active" as const } : {}),
    })
    .where(eq(organizations.id, org.id));

  await writeProfile(org.type, org.id, formData);
  revalidatePath("/portal", "layout");

  return NextResponse.json({ ok: true });
}
