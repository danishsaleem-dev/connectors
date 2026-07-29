import type { Metadata } from "next";
import { CtaSection } from "@/components/CtaSection";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { Eyebrow, Section } from "@/components/ui";
import { about, mission, values, vision, whyChoose } from "@/lib/content/company";
import { photos } from "@/lib/images";

export const metadata: Metadata = {
  title: "About",
  description:
    "Connectors bridges the gap between brands, franchisees, investors, landlords and project developers — one ecosystem instead of five vendors.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <Section className="pt-32 md:pt-40">
        <div className="max-w-3xl">
          <Reveal>
            <Eyebrow>About Connectors</Eyebrow>
          </Reveal>
          <Reveal i={1}>
            <h1 className="font-display display-xl mt-5 text-balance">
              We built the bridge that expansion kept falling through.
            </h1>
          </Reveal>
          <Reveal i={2}>
            <p className="mt-7 text-lg leading-relaxed text-[var(--muted)] text-pretty">
              {about[0]}
            </p>
          </Reveal>
        </div>
      </Section>

      <Section tone="sunken">
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <Reveal>
            <Photo
              photo={photos.office}
              sizes="(min-width: 1024px) 40vw, 100vw"
              aspect="portrait"
              className="rounded-2xl"
            />
          </Reveal>
          <div className="flex flex-col justify-center gap-6">
            {about.slice(1).map((paragraph, i) => (
              <Reveal key={paragraph.slice(0, 20)} i={i + 1}>
                <p className="leading-relaxed text-[var(--muted)] text-pretty">
                  {paragraph}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 sm:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
              <span className="font-display text-sm text-violet-600">Mission</span>
              <p className="font-display mt-4 text-2xl leading-snug text-balance">
                {mission}
              </p>
            </div>
          </Reveal>
          <Reveal i={1}>
            <div className="h-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
              <span className="font-display text-sm text-violet-600">Vision</span>
              <p className="font-display mt-4 text-2xl leading-snug text-balance">
                {vision}
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section tone="sunken">
        <Reveal>
          <Eyebrow>What we stand for</Eyebrow>
        </Reveal>
        <Reveal i={1}>
          <h2 className="font-display display-lg mt-4 max-w-xl text-balance">
            Five values, held the same way in every office.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-5">
          {values.map((value, i) => (
            <Reveal
              as="div"
              key={value.title}
              i={i % 5}
              className="bg-[var(--background)] p-7"
            >
              <span className="font-display text-sm text-violet-600">
                0{i + 1}
              </span>
              <h3 className="font-display mt-3 text-xl leading-snug">
                {value.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[var(--muted)]">
                {value.body}
              </p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Reveal>
              <Eyebrow>Why brands, investors and landlords choose us</Eyebrow>
            </Reveal>
            <Reveal i={1}>
              <h2 className="font-display display-lg mt-4 text-balance">
                One ecosystem, not five vendors.
              </h2>
            </Reveal>
            <Reveal i={2}>
              <Photo
                photo={photos.planning}
                sizes="(min-width: 1024px) 34vw, 100vw"
                aspect="landscape"
                className="mt-10 rounded-2xl"
              />
            </Reveal>
          </div>

          <ul>
            {whyChoose.map((item, i) => (
              <Reveal as="li" key={item.title} i={i % 4}>
                <div className="border-b border-[var(--border)] py-6">
                  <h3 className="font-display text-xl">{item.title}</h3>
                  <p className="mt-2 leading-relaxed text-[var(--muted)] text-pretty">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      <CtaSection secondary={{ href: "/services", label: "Explore our divisions" }} />
    </>
  );
}
