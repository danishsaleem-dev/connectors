import { NextResponse } from "next/server";
import { verifyMobileSession } from "@/lib/auth/mobile-session";
import { listReleasedInquiriesForConsultantOrg } from "@/lib/db/queries";

export const runtime = "nodejs";

/**
 * Backs the app's Requests tab (consultant role only, but not enforced
 * here — any other org type just gets an honestly empty list, since the
 * query is scoped to a consultants row owned by this org, and only a
 * consultant account has one). See consultantInquiryStatusEnum's doc
 * comment for why the inquirer's name/email/message are shown in full:
 * they submitted this specifically to reach this consultant.
 */
export async function GET(request: Request) {
  const session = await verifyMobileSession(request);
  if (!session || !session.organizationId) {
    return NextResponse.json({ ok: false, error: "Session expired." }, { status: 401 });
  }

  const rows = await listReleasedInquiriesForConsultantOrg(session.organizationId);
  return NextResponse.json({
    ok: true,
    requests: rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      message: r.message,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}
