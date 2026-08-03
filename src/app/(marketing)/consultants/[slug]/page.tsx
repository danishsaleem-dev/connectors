import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, GraduationCap } from "lucide-react";
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
  const [experienceUrls, educationUrls] = await Promise.all([
    Promise.all(experience.map((e) => resolveMediaUrl(e.attachment))),
    Promise.all(education.map((e) => resolveMediaUrl(e.attachment))),
  ]);

  const firstName = consultant.name.split(" ")[0];

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

            {consultant.expertise && consultant.expertise.length > 0 && (
              <Reveal i={2}>
                <div className="mt-6 flex flex-wrap gap-2">
                  {consultant.expertise.map((s) => (
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

      {experience.length > 0 && (
        <Section tone="sunken">
          <Reveal>
            <Eyebrow>Experience</Eyebrow>
          </Reveal>
          <Reveal i={1}>
            <h2 className="font-display display-lg mt-4 max-w-xl text-balance">
              Where {firstName} has done this before.
            </h2>
          </Reveal>

          {/* Timeline — the rail and dots make the sequence readable at a
              glance in a way the previous flat list didn't. */}
          <ol className="mt-12 ml-1 space-y-10 border-l border-[var(--border)]">
            {experience.map((e, i) => (
              <Reveal as="li" key={i} i={i % 4} className="relative pl-8">
                <span
                  aria-hidden="true"
                  className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-violet-600 ring-4 ring-[var(--surface-sunken)]"
                />
                {(e.yearFrom || e.yearTo) && (
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-violet-600">
                    {[e.yearFrom, e.yearTo].filter(Boolean).join(" — ")}
                  </p>
                )}
                <h3 className="font-display mt-2 text-xl">{e.title}</h3>
                {e.description && (
                  <p className="mt-2.5 max-w-2xl leading-relaxed text-[var(--muted)] text-pretty">
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
        </Section>
      )}

      {education.length > 0 && (
        <Section>
          <Reveal>
            <Eyebrow>Degrees &amp; certificates</Eyebrow>
          </Reveal>
          <Reveal i={1}>
            <h2 className="font-display display-lg mt-4 max-w-xl text-balance">
              Qualified on paper, as well as in practice.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {education.map((e, i) => (
              <Reveal key={i} i={i % 2}>
                <div className="flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-all hover:border-violet-400 hover:shadow-[0_28px_56px_-32px_rgba(20,20,26,0.3)]">
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <GraduationCap size={20} />
                    </span>
                    {e.year && (
                      <span className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
                        {e.year}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display mt-5 text-lg leading-snug">{e.title}</h3>
                  {e.description && (
                    <p className="mt-2.5 text-sm leading-relaxed text-[var(--muted)] text-pretty">
                      {e.description}
                    </p>
                  )}
                  {educationUrls[i] && (
                    <a
                      href={educationUrls[i]!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto inline-flex w-fit items-center gap-2 pt-5 text-xs font-medium text-violet-600 underline underline-offset-4"
                    >
                      <FileText size={12} />
                      View certificate
                    </a>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      <Section id="enquire" tone="sunken">
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
