import { OrbitField } from "@/components/OrbitField";
import { Reveal } from "@/components/Reveal";
import { ButtonLink, Eyebrow, Section } from "@/components/ui";

/**
 * Partners Program call-to-action, dropped into the audience and service
 * pages. Deliberately one shared component rather than repeated markup —
 * the wording changes in one place when the programme does.
 */
export function VendorCta({
  title = "Design it, draw it, build it, launch it?",
  body = "Our brands need designers, architects, interior specialists, agencies, consultants and contractors the moment a lease is signed. The Partners Program is how we find them.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <Section tone="dark" className="overflow-hidden">
      <OrbitField
        count={22}
        strokeWidth={0.3}
        className="animate-orbit pointer-events-none absolute -left-32 top-1/2 h-[30rem] w-[30rem] -translate-y-1/2 text-white/[0.07]"
      />
      <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-16">
        <div>
          <Reveal>
            <Eyebrow className="text-violet-200">Partners Program</Eyebrow>
          </Reveal>
          <Reveal i={1}>
            <h2 className="font-display display-lg mt-4 max-w-2xl text-balance">{title}</h2>
          </Reveal>
          <Reveal i={2}>
            <p className="mt-5 max-w-xl leading-relaxed text-white/65 text-pretty">{body}</p>
          </Reveal>
        </div>
        <Reveal i={3}>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <ButtonLink href="/become-a-vendor" variant="onDark">
              Become a vendor
            </ButtonLink>
            <ButtonLink href="/consultants" variant="outline">
              Browse partners
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
