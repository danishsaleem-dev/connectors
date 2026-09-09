import { NextResponse } from "next/server";
import { listPublishedConsultants } from "@/lib/db/queries";
import { resolveMediaUrl } from "@/lib/storage/media";

export const runtime = "nodejs";

/**
 * The published consultant roster — same rows and the same isPublished
 * gate as the website's own /consultants page (listPublishedConsultants),
 * just as JSON instead of a server-rendered page. No session required:
 * this is public information on the website already, so there's nothing
 * to protect by requiring one here that the website doesn't also require.
 */
export async function GET() {
  const consultants = await listPublishedConsultants();
  const withPhotos = await Promise.all(
    consultants.map(async (c) => ({
      id: c.id,
      slug: c.slug ?? c.id,
      name: c.name,
      title: c.title,
      photoUrl: await resolveMediaUrl(c.photoUrl),
      industries: c.industries ?? [],
      expertise: (c.expertise ?? []).map((e) => e.name).filter(Boolean),
      yearsExperience: c.yearsExperience,
    })),
  );
  return NextResponse.json({ ok: true, consultants: withPhotos });
}
