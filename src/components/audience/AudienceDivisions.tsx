import { Reveal } from "@/components/Reveal";
import { Eyebrow, Section } from "@/components/ui";
import { divisionsForAudience } from "@/lib/content/divisions";
import type { AudienceSlug } from "@/lib/site";

export function AudienceDivisions({
  audience,
  eyebrow = "How we work with you",
  title,
}: {
  audience: AudienceSlug;
  eyebrow?: string;
  title: string;
}) {
  const relevantDivisions = divisionsForAudience(audience);

  return (
    <Section>
      <Reveal>
        <Eyebrow>{eyebrow}</Eyebrow>
      </Reveal>
      <Reveal i={1}>
        <h2 className="font-display display-lg mt-4 max-w-2xl text-balance">{title}</h2>
      </Reveal>

      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
        {relevantDivisions.map((division, i) => (
          <Reveal
            as="div"
            key={division.slug}
            i={i % 3}
            className="bg-[var(--background)] p-7"
          >
            <span className="font-display text-sm text-violet-600">{division.index}</span>
            <h3 className="font-display mt-3 text-xl leading-snug">{division.navLabel}</h3>
            <p className="mt-2.5 text-sm leading-relaxed text-[var(--muted)]">
              {division.short}
            </p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
