import type { ReactNode } from "react";
import { resolveMediaUrl, resolveMediaUrls } from "@/lib/storage/media";

/**
 * Renders a property's photos/video links. Async because resolving a private
 * storage path into a viewable link is itself an awaited call — fine here
 * since these are Server Components, never rendered on the client.
 */
export async function PropertyMedia({
  photos,
  video,
}: {
  photos: string[] | null;
  video: string | null;
}) {
  const [resolvedPhotos, resolvedVideo] = await Promise.all([
    resolveMediaUrls(photos ?? []),
    resolveMediaUrl(video),
  ]);

  if (resolvedPhotos.length === 0 && !resolvedVideo) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {resolvedPhotos.map((url, i) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-violet-600 underline underline-offset-4"
        >
          Photo{resolvedPhotos.length > 1 ? ` ${i + 1}` : ""}
        </a>
      ))}
      {resolvedVideo && (
        <a
          href={resolvedVideo}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-violet-600 underline underline-offset-4"
        >
          Video
        </a>
      )}
    </div>
  );
}

/** Same idea for a single document link — resolves a storage path to a
 * signed URL, or passes an external pasted link straight through. */
export async function DocumentLink({ url, children }: { url: string; children: ReactNode }) {
  const resolved = await resolveMediaUrl(url);
  if (!resolved) {
    return <span className="text-[var(--muted)]">{children} (unavailable)</span>;
  }
  return (
    <a
      href={resolved}
      target="_blank"
      rel="noopener noreferrer"
      className="text-violet-600 underline underline-offset-4"
    >
      {children}
    </a>
  );
}
