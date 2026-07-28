import { photoSrcSet, photoUrl, photos, type Photo as PhotoData } from "@/lib/images";
import { Reveal } from "./Reveal";
import { QuickContactForm } from "./QuickContactForm";
import { offices, site } from "@/lib/site";

/**
 * Closing call-to-action, reused at the bottom of every marketing page.
 * Photo-backed rather than a flat colour block, so it reads as part of the
 * same photographic language as the rest of the page. Carries a real,
 * minimal contact form rather than a button linking out to a form
 * elsewhere — the whole point of "Let's talk" is to remove a step.
 */
export function CtaSection({
  eyebrow = "Let's talk",
  title = "Tell us what you're trying to grow.",
  body = "Whether you have a brand, capital, a space or an ambition — the first conversation costs nothing and usually clarifies a great deal.",
  secondary,
  photo = photos.office,
}: {
  eyebrow?: string;
  title?: string;
  body?: string;
  secondary?: { href: string; label: string };
  photo?: PhotoData;
}) {
  return (
    <section className="relative isolate overflow-hidden">
      <img
        src={photoUrl(photo.id, 2400)}
        srcSet={photoSrcSet(photo.id)}
        sizes="100vw"
        alt={photo.alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/92 via-ink/78 to-ink/45"
      />

      <div className="shell relative py-24 md:py-32">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <Reveal>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/55">
                {eyebrow}
              </p>
            </Reveal>
            <Reveal i={1}>
              <h2 className="font-display display-lg mt-4 text-balance text-white">
                {title}
              </h2>
            </Reveal>
            <Reveal i={2}>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-white/70 text-pretty">
                {body}
              </p>
            </Reveal>
            {secondary && (
              <Reveal i={3}>
                <a
                  href={secondary.href}
                  className="mt-6 inline-block text-sm text-white/70 underline underline-offset-4 transition-colors hover:text-white"
                >
                  {secondary.label}
                </a>
              </Reveal>
            )}

            <Reveal i={4}>
              <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/15 pt-6">
                {offices.map((office) => (
                  <div key={office.id}>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                      {office.address.locality}
                    </p>
                    <a
                      href={`tel:${office.phone.href}`}
                      className="mt-1 block text-sm text-white/85 transition-colors hover:text-white"
                    >
                      {office.phone.display}
                    </a>
                  </div>
                ))}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                    Email
                  </p>
                  <a
                    href={`mailto:${site.email.general}`}
                    className="mt-1 block text-sm text-white/85 transition-colors hover:text-white"
                  >
                    {site.email.general}
                  </a>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal i={2}>
            <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-6 backdrop-blur-sm md:p-8">
              <QuickContactForm />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
