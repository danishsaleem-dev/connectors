import { OrbitField } from "@/components/OrbitField";
import { Reveal } from "@/components/Reveal";
import { ButtonLink, Eyebrow, Section } from "@/components/ui";

/**
 * A signup-focused CTA — distinct from VendorCta (which recruits Partners
 * Program vendors) and CtaSection (a contact form). This one nudges a
 * visitor toward creating a portal account, e.g. right after a gated
 * preview like AvailableLocationsSection, where the friction it's solving
 * is immediately obvious.
 */
export function JoinCommunityCta({
  eyebrow = "Connectors Portal",
  title = "Join our community.",
  body = "Create a free account and you're in — browse every location in full, save your favourites, and enquire directly. No waiting on a form.",
  buttonLabel = "Join our community",
}: {
  eyebrow?: string;
  title?: string;
  body?: string;
  buttonLabel?: string;
}) {
  return (
    <Section tone="dark" className="overflow-hidden">
      <OrbitField
        count={22}
        strokeWidth={0.3}
        className="animate-orbit pointer-events-none absolute -right-32 top-1/2 h-[30rem] w-[30rem] -translate-y-1/2 text-white/[0.07]"
      />
      <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-16">
        <div>
          <Reveal>
            <Eyebrow className="text-violet-200">{eyebrow}</Eyebrow>
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
            <ButtonLink href="?auth=register" variant="onDark">
              {buttonLabel}
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
