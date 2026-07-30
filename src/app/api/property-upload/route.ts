import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getCurrentUser } from "@/lib/auth/current-user";

/**
 * Issues short-lived, scoped client tokens for direct browser-to-Blob
 * uploads — files never pass through this server, only this small token
 * exchange does, so there's no serverless body-size limit to bump.
 *
 * Only wired up once BLOB_READ_WRITE_TOKEN is set; until then
 * NEXT_PUBLIC_ENABLE_FILE_UPLOAD stays unset and the property forms fall
 * back to paste-in links, so this route is never called.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          "image/jpeg",
          "image/png",
          "image/webp",
          "video/mp4",
          "video/quicktime",
        ],
        maximumSizeInBytes: 50 * 1024 * 1024,
        addRandomSuffix: true,
        tokenPayload: JSON.stringify({ userId: user.id }),
      }),
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    console.error("[property-upload] failed", err);
    return NextResponse.json(
      { error: (err as Error).message ?? "Upload failed." },
      { status: 400 },
    );
  }
}
