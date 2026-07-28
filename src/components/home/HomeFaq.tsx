import Link from "next/link";
import { FaqList } from "@/components/Faq";
import { Reveal } from "@/components/Reveal";
import { Eyebrow, Section } from "@/components/ui";
import { faqs } from "@/lib/content/faq";

export function HomeFaq() {
  return (
    <Section>
      <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Reveal>
            <Eyebrow>Questions</Eyebrow>
          </Reveal>
          <Reveal i={1}>
            <h2 className="font-display display-lg mt-4 text-balance">
              Common questions, answered plainly.
            </h2>
          </Reveal>
          <Reveal i={2}>
            <p className="mt-6 max-w-sm leading-relaxed text-[var(--muted)] text-pretty">
              Don't see yours here?{" "}
              <Link
                href="/contact"
                className="text-violet-600 underline underline-offset-4"
              >
                Ask us directly
              </Link>{" "}
              — we read every message ourselves.
            </p>
          </Reveal>
        </div>

        <Reveal i={1}>
          <FaqList items={faqs} />
        </Reveal>
      </div>
    </Section>
  );
}
