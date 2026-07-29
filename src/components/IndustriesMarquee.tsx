import { Marquee } from "@/components/Marquee";
import { Reveal } from "@/components/Reveal";
import { Eyebrow } from "@/components/ui";
import { industries } from "@/lib/content/company";

/** The industries strip used on the homepage and every audience page. */
export function IndustriesMarquee() {
  return (
    <section className="border-y border-[var(--border)] py-16">
      <div className="shell">
        <Reveal>
          <Eyebrow>Industries we serve</Eyebrow>
        </Reveal>
      </div>
      <Marquee className="mt-8" duration="55s">
        {industries.map((industry) => (
          <span
            key={industry}
            className="font-display mx-8 whitespace-nowrap text-3xl text-[var(--muted)] md:text-4xl"
          >
            {industry}
            <span className="ml-8 text-violet-600/40">·</span>
          </span>
        ))}
      </Marquee>
    </section>
  );
}
