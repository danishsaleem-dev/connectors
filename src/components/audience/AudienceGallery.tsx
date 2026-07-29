import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { Eyebrow, Section } from "@/components/ui";
import type { Photo as PhotoData } from "@/lib/images";

export type GalleryItem = {
  photo: PhotoData;
  caption: string;
};

/**
 * Photo-led "featured" section for the audience landing pages. Every audience
 * page previously carried exactly one photo (the hero) — everything below it
 * was text and iconography. This breaks that up with real photography, tied
 * to the audience's own story rather than reused stock filler.
 */
export function AudienceGallery({
  eyebrow,
  title,
  body,
  items,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  items: [GalleryItem, GalleryItem, GalleryItem];
}) {
  const [large, ...rest] = items;

  return (
    <Section tone="sunken">
      <div className="max-w-2xl">
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
        <Reveal i={1}>
          <h2 className="font-display display-lg mt-4 text-balance">{title}</h2>
        </Reveal>
        {body && (
          <Reveal i={2}>
            <p className="mt-5 leading-relaxed text-[var(--muted)] text-pretty">
              {body}
            </p>
          </Reveal>
        )}
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr]">
        <Reveal i={1} className="relative overflow-hidden rounded-2xl">
          <Photo
            photo={large.photo}
            sizes="(min-width: 1024px) 45vw, 100vw"
            aspect="none"
            className="h-full min-h-[20rem]"
            overlay="soft"
          />
          <p className="absolute bottom-6 left-6 right-6 font-display text-xl leading-snug text-white">
            {large.caption}
          </p>
        </Reveal>

        <div className="grid gap-4">
          {rest.map((item, i) => (
            <Reveal
              key={item.photo.id}
              i={i + 2}
              className="relative overflow-hidden rounded-2xl"
            >
              <Photo
                photo={item.photo}
                sizes="(min-width: 1024px) 30vw, 100vw"
                aspect="landscape"
                overlay="soft"
              />
              <p className="absolute bottom-5 left-5 right-5 font-display text-base leading-snug text-white">
                {item.caption}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
