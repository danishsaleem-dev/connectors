import type { Metadata } from "next";
import { CtaSection } from "@/components/CtaSection";
import { Reveal } from "@/components/Reveal";
import { Eyebrow, Section } from "@/components/ui";
import { photos } from "@/lib/images";
import { offices, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach Connectors in the UK, US or Pakistan — or send a message and we'll route it to the right division.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <Section className="pt-32 md:pt-40">
        <div className="max-w-3xl">
          <Reveal>
            <Eyebrow>Contact</Eyebrow>
          </Reveal>
          <Reveal i={1}>
            <h1 className="font-display display-xl mt-5 text-balance">
              Three offices. One conversation to start.
            </h1>
          </Reveal>
          <Reveal i={2}>
            <p className="mt-7 text-lg leading-relaxed text-[var(--muted)] text-pretty">
              Whichever office is closest, every enquiry reaches the same
              team. Call, email, or send a message below and we'll route it
              to the right division.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {offices.map((office, i) => (
            <Reveal
              key={office.id}
              i={i}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-violet-600">
                {office.label}
              </p>
              <address className="mt-4 text-sm not-italic leading-relaxed text-[var(--muted)]">
                {office.address.street}
                <br />
                {office.address.locality}
                {office.address.region ? ` ${office.address.region}` : ""}
                {office.address.postalCode ? ` ${office.address.postalCode}` : ""}
                <br />
                {office.address.country}
              </address>
              <a
                href={`tel:${office.phone.href}`}
                className="mt-4 inline-block text-sm font-medium text-[var(--foreground)] transition-colors hover:text-violet-600"
              >
                {office.phone.display}
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal i={3}>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-2 border-t border-[var(--border)] pt-8 text-sm">
            <a
              href={`mailto:${site.email.brands}`}
              className="text-[var(--muted)] transition-colors hover:text-violet-600"
            >
              Brands — {site.email.brands}
            </a>
            <a
              href={`mailto:${site.email.franchise}`}
              className="text-[var(--muted)] transition-colors hover:text-violet-600"
            >
              Franchisees — {site.email.franchise}
            </a>
            <a
              href={`mailto:${site.email.landlords}`}
              className="text-[var(--muted)] transition-colors hover:text-violet-600"
            >
              Landlords — {site.email.landlords}
            </a>
            <a
              href={`mailto:${site.email.investors}`}
              className="text-[var(--muted)] transition-colors hover:text-violet-600"
            >
              Investors — {site.email.investors}
            </a>
          </div>
        </Reveal>
      </Section>

      <CtaSection
        photo={photos.office}
        eyebrow="Send a message"
        title="Tell us what you're trying to grow."
        body="Whether you have a brand, capital, a space or an ambition — the first conversation costs nothing and usually clarifies a great deal."
      />
    </>
  );
}
