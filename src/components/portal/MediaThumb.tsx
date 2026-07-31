import { FileText } from "lucide-react";
import { resolveMediaUrl } from "@/lib/storage/media";

const IMAGE_EXTENSION = /\.(jpe?g|png|webp|gif|avif|heic|heif)$/i;

function FileIcon() {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-sunken)] text-[var(--muted)]">
      <FileText size={20} />
    </div>
  );
}

/**
 * A small preview for one media-library row — a resolved thumbnail for an
 * image, a generic file icon otherwise. There's no stored content-type to key
 * off (documents only ever carried a title/url/kind), so this goes by file
 * extension — good enough for a preview, not load-bearing anywhere else.
 */
export async function MediaThumb({ url, alt }: { url: string; alt: string }) {
  if (!IMAGE_EXTENSION.test(url)) return <FileIcon />;

  const resolved = await resolveMediaUrl(url);
  if (!resolved) return <FileIcon />;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- a private, signed
    // Storage URL (or an arbitrary external link), not next/image material.
    <img
      src={resolved}
      alt={alt}
      className="h-12 w-12 shrink-0 rounded-lg border border-[var(--border)] object-cover"
    />
  );
}
