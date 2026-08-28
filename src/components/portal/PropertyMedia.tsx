import type { ReactNode } from "react";
import { PlayCircle } from "lucide-react";
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
      {resolvedPhotos.map((url) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] transition-opacity hover:opacity-80"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- private signed Storage URL */}
          <img src={url} alt="" className="h-full w-full object-cover" />
        </a>
      ))}
      {resolvedVideo && (
        <a
          href={resolvedVideo}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-sunken)] text-[11px] text-violet-600 underline-offset-4 hover:underline"
        >
          <PlayCircle size={18} />
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
