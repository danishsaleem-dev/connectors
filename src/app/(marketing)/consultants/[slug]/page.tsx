import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, FileText, GraduationCap } from "lucide-react";
import { ConsultantInquiryForm } from "@/components/ConsultantInquiryForm";
import { Reveal } from "@/components/Reveal";
import { ButtonLink, Eyebrow, Section } from "@/components/ui";
import { getPublishedConsultantBySlug } from "@/lib/db/queries";
import { resolveMediaUrl } from "@/lib/storage/media";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const consultant = await getPublishedConsultantBySlug(slug);
  if (!consultant) return { title: "Not found" };

  return {
    title: consultant.name,
    description: consultant.bio ?? `${consultant.name} — consultant at Connectors.`,
    alternates: { canonical: `/consultants/${slug}` },
  };
}

export default async function ConsultantProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const consultant = await getPublishedConsultantBySlug(slug);
  if (!consultant) notFound();

  const photo = await resolveMediaUrl(consultant.photoUrl);
  const experience = consultant.experience ?? [];
  const education = consultant.education ?? [];
  const expertise = consultant.expertise ?? [];
  const [experienceUrls, educationUrls] = await Promise.all([
    Promise.all(experience.map((e) => resolveMediaUrl(e.attachment))),
    Promise.all(education.map((e) => resolveMediaUrl(e.attachment))),
  ]);

  const firstName = consultant.firstName || consultant.name.split(" ")[0];

  return (
    <>
      {/* Hero — the portrait is the anchor of a person's profile, so it gets
          real size here rather than the small avatar-over-cover treatment
          this page used before. */}
      <Section className="pt-32 md:pt-40">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
          <Reveal>
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -bottom-5 -left-5 hidden h-full w-full rounded-3xl border border-violet-600/20 bg-violet-50/50 sm:block"
              />
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface-sunken)]">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- private signed Storage URL
                  <img src={photo} alt={consultant.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="font-display text-7xl text-[var(--muted)]/30">
                      {consultant.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <Eyebrow>Consultant</Eyebrow>
            </Reveal>
            <Reveal i={1}>
              <h1 className="font-display display-xl mt-5 text-balance">{consultant.name}</h1>
            </Reveal>

            {expertise.length > 0 && (
              <Reveal i={2}>
                <div className="mt-6 flex flex-wrap gap-2">
                  {expertise.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-violet-600/25 bg-violet-50 px-3.5 py-1.5 text-sm text-violet-600"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </Reveal>
            )}

            {consultant.bio && (
              <Reveal i={3}>
                <div className="mt-7 space-y-4">
                  {consultant.bio.split(/\n\s*\n/).map((para, i) => (
                    <p key={i} className="leading-relaxed text-[var(--muted)] text-pretty">
                      {para}
                    </p>
                  ))}
                </div>
              </Reveal>
            )}

            {consultant.yearsExperience != null && (
              <Reveal i={4}>
                <div className="mt-8 flex items-baseline gap-3 border-t border-[var(--border)] pt-6">
                  <span className="font-display text-4xl text-violet-600">
                    {consultant.yearsExperience}
                  </span>
                  <span className="text-sm text-[var(--muted)]">years of experience</span>
                </div>
              </Reveal>
            )}

            <Reveal i={5}>
              <div className="mt-8">
                <ButtonLink href="#enquire" size="lg">
                  Enquire about {firstName}
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* Expertise — the main point of the page, so it gets its own
          full-width section rather than just the chip row above. */}
      {expertise.length > 0 && (
        <Section tone="sunken">
          <div className="max-w-2xl">
            <Reveal>
              <Eyebrow>Expertise</Eyebrow>
            </Reveal>
            <Reveal i={1}>
              <h2 className="font-display display-lg mt-4 text-balance">
                What {firstName} helps with.
              </h2>
            </Reveal>
          </div>

          <ul className="mt-12 grid gap-x-10 gap-y-1 sm:grid-cols-2">
            {expertise.map((s, i) => (
              <Reveal as="li" key={s} i={i % 6}>
                <div className="flex items-start gap-3 border-b border-[var(--border)] py-4">
                  <Check size={16} className="mt-0.5 shrink-0 text-violet-600" />
                  <span className="text-[15px] leading-relaxed">{s}</span>
                </div>
              </Reveal>
            ))}
          </ul>
        </Section>
      )}

      {/* Experience — heading sticky in its own narrower column instead of
          full shell width, so a short entry like "Chief Executive Officer"
          doesn't leave a wall of empty space beside it. */}
      {experience.length > 0 && (
        <Section>
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <Reveal>
                <Eyebrow>Experience</Eyebrow>
              </Reveal>
              <Reveal i={1}>
                <h2 className="font-display display-lg mt-4 text-balance">
                  Where {firstName} has done this before.
                </h2>
              </Reveal>
            </div>

            <ol className="ml-1 space-y-10 border-l border-[var(--border)]">
              {experience.map((e, i) => (
                <Reveal as="li" key={i} i={i % 4} className="relative pl-8">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-violet-600 ring-4 ring-[var(--background)]"
                  />
                  {(e.yearFrom || e.yearTo) && (
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-violet-600">
                      {[e.yearFrom, e.yearTo].filter(Boolean).join(" — ")}
                    </p>
                  )}
                  <h3 className="font-display mt-2 text-xl">{e.title}</h3>
                  {e.description && (
                    <p className="mt-2.5 leading-relaxed text-[var(--muted)] text-pretty">
                      {e.description}
                    </p>
                  )}
                  {experienceUrls[i] && (
                    <a
                      href={experienceUrls[i]!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-xs font-medium text-[var(--muted)] transition-colors hover:border-violet-400 hover:text-violet-600"
                    >
                      <FileText size={12} />
                      View document
                    </a>
                  )}
                </Reveal>
              ))}
            </ol>
          </div>
        </Section>
      )}

      {/* Degrees & certificates — deliberately understated: a compact list,
          not a grid of cards, so it doesn't compete with Expertise above. */}
      {education.length > 0 && (
        <Section tone="sunken">
          <div className="max-w-2xl">
            <Reveal>
              <Eyebrow>Degrees &amp; certificates</Eyebrow>
            </Reveal>
          </div>

          <div className="mt-8 divide-y divide-[var(--border)] border-t border-[var(--border)]">
            {education.map((e, i) => (
              <Reveal key={i} i={i % 4} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5 py-4">
                <div className="flex min-w-0 items-center gap-2.5">
                  <GraduationCap size={15} className="shrink-0 text-violet-600" />
                  <span className="font-medium">{e.title}</span>
                  {e.year && (
                    <span className="shrink-0 text-xs text-[var(--muted)]">{e.year}</span>
                  )}
                </div>
                {educationUrls[i] && (
                  <a
                    href={educationUrls[i]!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-violet-600 underline underline-offset-4"
                  >
                    <FileText size={12} />
                    View certificate
                  </a>
                )}
                {e.description && (
                  <p className="w-full pl-[1.6rem] text-sm leading-relaxed text-[var(--muted)] text-pretty">
                    {e.description}
                  </p>
                )}
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      <Section id="enquire">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-20">
          <div>
            <Reveal>
              <Eyebrow>Enquire</Eyebrow>
            </Reveal>
            <Reveal i={1}>
              <h2 className="font-display display-lg mt-4 text-balance">
                Tell {firstName} what you're deciding.
              </h2>
            </Reveal>
            <Reveal i={2}>
              <p className="mt-5 max-w-md leading-relaxed text-[var(--muted)] text-pretty">
                Describe the decision in front of you — site selection,
                feasibility, franchise structuring — and our team will set up
                the conversation.
              </p>
            </Reveal>
          </div>

          <Reveal i={1}>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
              <ConsultantInquiryForm
                consultantId={consultant.id}
                consultantName={consultant.name}
              />
            </div>
          </Reveal>
        </div>

        <div className="mt-16 border-t border-[var(--border)] pt-8">
          <Link
            href="/consultants"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted)] transition-colors hover:text-violet-600"
          >
            <ArrowLeft size={15} />
            Back to consultants
          </Link>
        </div>
      </Section>
    </>
  );
}
