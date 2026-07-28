import { clsx } from "clsx";
import { photoSrcSet, photoUrl, type Photo as PhotoData } from "@/lib/images";

/**
 * A responsive photo.
 *
 * Plain <img> rather than next/image on purpose: `images.unoptimized` is on
 * (matching the other projects), so next/image would render this exact element
 * anyway while charging us an extra abstraction. Unsplash already does the
 * resizing via its `w` parameter, so a hand-built srcset is the honest version.
 */
export function Photo({
  photo,
  sizes,
  className,
  imgClassName,
  priority = false,
  aspect = "landscape",
  overlay,
}: {
  photo: PhotoData;
  /** Required for the browser to pick sensibly from the srcset. */
  sizes: string;
  className?: string;
  imgClassName?: string;
  /** Set on the LCP image only — eager + high fetch priority. */
  priority?: boolean;
  aspect?: "landscape" | "portrait" | "square" | "wide" | "none";
  /** Scrim strength for type sitting on top of the image. */
  overlay?: "none" | "soft" | "strong";
}) {
  return (
    <div
      className={clsx(
        "relative overflow-hidden bg-[var(--surface-sunken)]",
        aspect === "landscape" && "aspect-[4/3]",
        aspect === "portrait" && "aspect-[3/4]",
        aspect === "square" && "aspect-square",
        aspect === "wide" && "aspect-[16/9]",
        className,
      )}
    >
      <img
        src={photoUrl(photo.id, 1600)}
        srcSet={photoSrcSet(photo.id)}
        sizes={sizes}
        alt={photo.alt}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        className={clsx("h-full w-full object-cover", imgClassName)}
      />
      {overlay && overlay !== "none" && (
        <div
          aria-hidden="true"
          className={clsx(
            "absolute inset-0",
            overlay === "soft" &&
              "bg-gradient-to-t from-ink/55 via-ink/10 to-transparent",
            overlay === "strong" &&
              "bg-gradient-to-br from-ink/85 via-ink/65 to-ink/40",
          )}
        />
      )}
    </div>
  );
}
