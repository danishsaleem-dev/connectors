import { FaqList } from "@/components/Faq";
import { Reveal } from "@/components/Reveal";
import { VideoEmbed } from "@/components/VideoEmbed";
import { Eyebrow, Section } from "@/components/ui";
import type { Faq } from "@/lib/content/faq";

/** Video on the left, FAQ accordion on the right — first built for
 * /consultants, pulled out here so any page can pair a video with its own
 * FAQ set without re-authoring the layout. */
export function FaqVideoSection({
  eyebrow = "Questions",
  heading,
  videoUrl,
  videoTitle,
  faqs,
  tone = "sunken",
}: {
  eyebrow?: string;
  heading: string;
  videoUrl: string | null;
  videoTitle: string;
  faqs: Faq[];
  tone?: "default" | "sunken" | "dark";
}) {
  return (
    <Section tone={tone}>
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <Reveal>
          <VideoEmbed url={videoUrl} title={videoTitle} />
        </Reveal>
        <div>
          <Reveal>
            <Eyebrow>{eyebrow}</Eyebrow>
          </Reveal>
          <Reveal i={1}>
            <h2 className="font-display display-lg mt-4 text-balance">{heading}</h2>
          </Reveal>
          <Reveal i={2} className="mt-8">
            <FaqList items={faqs} />
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
