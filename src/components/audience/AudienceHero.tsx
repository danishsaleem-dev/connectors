import { ArrowDown } from "lucide-react";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { Eyebrow } from "@/components/ui";
import type { Photo as PhotoData } from "@/lib/images";

/**
 * Photo-backed page header, shared across every audience landing page.
 *
 * The container uses `min-h` + flex, not a fixed `h-`, specifically because a
 * fixed height plus bottom-anchored text broke on longer headings (the
 * investors page's four-line lead): the text block had no `top`, so it grew
 * upward from the bottom edge as content got taller, escaping past the
 * section's own top edge and rendering behind the fixed header, which
 * visually clipped the first line or two. With `min-h` + `flex-col
 * justify-end`, the section grows to fit whatever the content actually
 * needs — it never clips — and the generous top padding keeps content clear
 * of the fixed header even when it does grow.
 *
 * The photo sits in its own `absolute inset-0` wrapper rather than passing
 * that className straight to <Photo> — Photo's root div hardcodes `relative`,
 * and Tailwind v4 orders `.absolute`/`.relative` in its compiled stylesheet
 * such that `relative` wins regardless of which comes later in the class
 * string. A real bug this caused: the photo silently stopped covering the
 * hero once the container grew taller than its min-height to fit longer
 * heading text, leaving a bare gap below the image.
 */
export function AudienceHero({
  eyebrow,
  title,
  photo,
  jumpLabel,
  jumpHref = "#request-form",
}: {
  eyebrow: string;
  title: string;
  photo: PhotoData;
  jumpLabel: string;
  jumpHref?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="relative flex min-h-[28rem] flex-col justify-end sm:min-h-[32rem]">
        <div className="absolute inset-0">
          <Photo
            photo={photo}
            sizes="100vw"
            aspect="none"
            className="h-full"
            priority
            overlay="strong"
          />
        </div>
        <div className="shell relative pb-10 pt-28 sm:pb-14 sm:pt-32">
          <Reveal>
            <Eyebrow className="text-white/55">{eyebrow}</Eyebrow>
          </Reveal>
          <Reveal i={1}>
            <h1 className="font-display display-lg mt-4 max-w-5xl text-balance text-white">
              {title}
            </h1>
          </Reveal>
          <Reveal i={2}>
            <a
              href={jumpHref}
              className="mt-6 inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/60 transition-colors hover:text-white sm:mt-8"
            >
              <ArrowDown size={14} />
              {jumpLabel}
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
