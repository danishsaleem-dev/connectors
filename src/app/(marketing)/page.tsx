import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { AppShowcase } from "@/components/home/AppShowcase";
import { FaqVideoSection } from "@/components/FaqVideoSection";
import { TestimonialSection } from "@/components/TestimonialSection";
import { CtaSection } from "@/components/CtaSection";
import { Marquee } from "@/components/Marquee";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { Eyebrow, Section } from "@/components/ui";
import { connections, industries, process } from "@/lib/content/company";
import { divisions } from "@/lib/content/divisions";
import { faqs } from "@/lib/content/faq";
import { homeTestimonials, homeVideoUrl } from "@/lib/content/testimonials";
import { photos } from "@/lib/images";
import { audiences, stats } from "@/lib/site";

/** One photo per audience, so the four cards don't read as a template. */
const audiencePhotos = {
  "for-brands": photos.boutique,
  "for-franchise": photos.restaurant,
  "for-landlords": photos.towers,
  "for-investors": photos.boardroom,
} as const;

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* ---------------------------------------------------------- */}
      {/*  What we do — the connection model, stated plainly           */}
      {/* ---------------------------------------------------------- */}
      <Section id="what-we-do">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Reveal>
              <Eyebrow>What we do</Eyebrow>
            </Reveal>
            <Reveal i={1}>
              <h2 className="font-display display-lg mt-4 text-balance">
                We connect the two halves of every deal.
              </h2>
            </Reveal>
            <Reveal i={2}>
              <p className="mt-6 max-w-md leading-relaxed text-[var(--muted)] text-pretty">
                Expansion stalls in the gap between people who don&apos;t know
                each other exist. Connectors works both sides of that gap at
                once — the brand and the landlord, the franchisor and the
                franchisee, the opportunity and the capital.
              </p>
            </Reveal>
            <Reveal i={3}>
              <Photo
                photo={photos.checkout}
                sizes="(min-width: 1024px) 34vw, 100vw"
                aspect="landscape"
                className="mt-10 rounded-2xl"
              />
            </Reveal>
          </div>

          <ul>
            {connections.map((line, i) => {
              const [left, right] = line.split(" with ");
              return (
                <Reveal as="li" key={line} i={i % 4}>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-[var(--border)] py-5">
                    <span className="font-display text-xl md:text-2xl">
                      {left}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-violet-600">
                      with
                    </span>
                    <span className="font-display text-xl text-[var(--muted)] md:text-2xl">
                      {right}
                    </span>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </Section>

      {/* ---------------------------------------------------------- */}
      {/*  Audiences — the four doors in                               */}
      {/* ---------------------------------------------------------- */}
      <Section tone="sunken">
        <Reveal>
          <Eyebrow>Who we serve</Eyebrow>
        </Reveal>
        <Reveal i={1}>
          <h2 className="font-display display-lg mt-4 max-w-2xl text-balance">
            Four ways in. One network behind them.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {audiences.map((audience, i) => (
            <Reveal key={audience.slug} i={i}>
              <Link href={`/${audience.slug}`} className="group block h-full">
                <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-[var(--shadow-lift)]">
                  <Photo
                    photo={audiencePhotos[audience.slug]}
                    sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 100vw"
                    aspect="landscape"
                    imgClassName="transition-transform duration-[900ms] group-hover:scale-105"
                  />
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <h3 className="font-display text-2xl">{audience.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                        {audience.lead}
                      </p>
                    </div>
                    <span className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-violet-600">
                      {audience.nav}
                      <ArrowUpRight
                        size={16}
                        className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </article>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------------- */}
      {/*  Divisions                                                   */}
      {/* ---------------------------------------------------------- */}
      <Section>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal>
              <Eyebrow>Our divisions</Eyebrow>
            </Reveal>
            <Reveal i={1}>
              <h2 className="font-display display-lg mt-4 max-w-xl text-balance">
                Seven divisions, one growth journey.
              </h2>
            </Reveal>
          </div>
          <Reveal i={2}>
            <Link
              href="/solutions"
              className="inline-flex items-center gap-1.5 text-sm text-violet-600 underline underline-offset-4"
            >
              View all services
              <ArrowUpRight size={15} />
            </Link>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">
          {/* Photo cell anchors the grid and breaks the run of text tiles. */}
          <div className="relative col-span-1 hidden sm:col-span-2 lg:block lg:row-span-2">
            <Photo
              photo={photos.cafe}
              sizes="(min-width: 1024px) 25vw, 50vw"
              aspect="none"
              className="h-full"
              overlay="soft"
            />
            <p className="absolute bottom-6 left-6 right-6 font-display text-xl leading-snug text-white">
              Everything under one platform.
            </p>
          </div>

          {divisions.map((division, i) => (
            <Link
              key={division.slug}
              href={`/solutions/${division.slug}`}
              className="group relative flex flex-col justify-between bg-[var(--background)] p-7 transition-colors duration-500 hover:bg-violet-50"
            >
              <Reveal i={i % 3}>
                <span className="font-display text-sm text-violet-600">
                  {division.index}
                </span>
                <h3 className="font-display mt-3 text-xl leading-snug">
                  {division.navLabel}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[var(--muted)]">
                  {division.short}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm text-violet-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Explore
                  <ArrowUpRight size={15} />
                </span>
              </Reveal>
            </Link>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------------- */}
      {/*  The app                                                     */}
      {/* ---------------------------------------------------------- */}
      <AppShowcase />

      {/* ---------------------------------------------------------- */}
      {/*  Industries                                                  */}
      {/* ---------------------------------------------------------- */}
      <section className="border-b border-[var(--border)] py-16">
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

      {/* ---------------------------------------------------------- */}
      {/*  Process                                                     */}
      {/* ---------------------------------------------------------- */}
      <Section>
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Reveal>
              <Eyebrow>How it works</Eyebrow>
            </Reveal>
            <Reveal i={1}>
              <h2 className="font-display display-lg mt-4 text-balance">
                From first conversation to an operating network.
              </h2>
            </Reveal>
            <Reveal i={2}>
              <div className="mt-10 grid grid-cols-2 gap-4">
                <Photo
                  photo={photos.planning}
                  sizes="(min-width: 1024px) 20vw, 45vw"
                  aspect="portrait"
                  className="rounded-2xl"
                />
                <Photo
                  photo={photos.signing}
                  sizes="(min-width: 1024px) 20vw, 45vw"
                  aspect="portrait"
                  className="mt-10 rounded-2xl"
                />
              </div>
            </Reveal>
          </div>

          <ol className="relative border-l border-[var(--border)] pl-8 md:pl-12">
            {process.map((phase, i) => (
              <Reveal
                as="li"
                key={phase.step}
                i={i}
                className="relative pb-12 last:pb-0"
              >
                <span
                  aria-hidden="true"
                  className="absolute -left-[2.28rem] top-2 h-2.5 w-2.5 rounded-full bg-violet-600 ring-4 ring-[var(--background)] md:-left-[3.28rem]"
                />
                <span className="font-display text-sm text-violet-600">
                  {phase.step}
                </span>
                <h3 className="font-display mt-2 text-2xl">{phase.title}</h3>
                <p className="mt-3 max-w-lg leading-relaxed text-[var(--muted)] text-pretty">
                  {phase.body}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </Section>

      <TestimonialSection heading="Successful stories" items={homeTestimonials} />

      <FaqVideoSection
        heading="Common questions, answered plainly."
        videoUrl={homeVideoUrl}
        videoTitle="How Connectors works"
        faqs={faqs}
      />

      {/* Real figures only — see the note on `stats` in src/lib/site.ts. */}
      {stats.length > 0 && (
        <Section tone="sunken" className="py-16 md:py-20">
          <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} i={i}>
                <dt className="font-display display-md text-violet-600">
                  {stat.value}
                </dt>
                <dd className="mt-2 text-sm text-[var(--muted)]">{stat.label}</dd>
              </Reveal>
            ))}
          </dl>
        </Section>
      )}

      <CtaSection secondary={{ href: "/solutions", label: "Explore services" }} />
    </>
  );
}
