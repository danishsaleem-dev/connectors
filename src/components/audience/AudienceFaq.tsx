import { FaqList } from "@/components/Faq";
import { Reveal } from "@/components/Reveal";
import { Eyebrow, Section } from "@/components/ui";
import type { Faq } from "@/lib/content/faq";

export function AudienceFaq({
  title = "Before you fill out the form.",
  items,
}: {
  title?: string;
  items: Faq[];
}) {
  return (
    <Section>
      <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Reveal>
            <Eyebrow>Questions</Eyebrow>
          </Reveal>
          <Reveal i={1}>
            <h2 className="font-display display-lg mt-4 text-balance">{title}</h2>
          </Reveal>
        </div>
        <Reveal i={1}>
          <FaqList items={items} />
        </Reveal>
      </div>
    </Section>
  );
}
