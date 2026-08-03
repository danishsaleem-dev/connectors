import { clsx } from "clsx";
import { Play } from "lucide-react";

/**
 * One url field handles every source the marketing team is likely to paste:
 * a YouTube or Vimeo link becomes a player embed, anything else is treated
 * as a direct file and played natively. A null url renders an honest
 * placeholder rather than an empty black box or a broken player.
 */
function embedSrc(url: string) {
  const youtube = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/,
  );
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`;

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

  return null;
}

export function VideoEmbed({
  url,
  title,
  className,
}: {
  url: string | null;
  title: string;
  className?: string;
}) {
  const src = url ? embedSrc(url) : null;

  return (
    <div
      className={clsx(
        "relative aspect-video overflow-hidden rounded-2xl border border-[var(--border)] bg-ink",
        className,
      )}
    >
      {src ? (
        <iframe
          src={src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : url ? (
        <video
          src={url}
          controls
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/40">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20">
            <Play size={20} className="ml-0.5" />
          </span>
          <span className="text-xs uppercase tracking-[0.18em]">Video coming soon</span>
        </div>
      )}
    </div>
  );
}
