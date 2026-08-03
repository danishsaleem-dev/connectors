import { Reveal } from "@/components/Reveal";
import { TestimonialSlider, type TestimonialWithVideo } from "@/components/TestimonialSlider";
import { Eyebrow, Section } from "@/components/ui";

/** Heading + the video-paired testimonial slider — first built for
 * /consultants, pulled out here so any page can drop in its own
 * testimonials without re-authoring the section around the slider. */
export function TestimonialSection({
  eyebrow = "What clients say",
  heading,
  items,
}: {
  eyebrow?: string;
  heading: string;
  items: TestimonialWithVideo[];
}) {
  if (items.length === 0) return null;

  return (
    <Section>
      <Reveal>
        <Eyebrow>{eyebrow}</Eyebrow>
      </Reveal>
      <Reveal i={1}>
        <h2 className="font-display display-lg mt-4 max-w-2xl text-balance">{heading}</h2>
      </Reveal>
      <Reveal i={2} className="mt-12">
        <TestimonialSlider items={items} />
      </Reveal>
    </Section>
  );
}
