import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, FileText } from "lucide-react";
import { ConsultantInquiryForm } from "@/components/ConsultantInquiryForm";
import { OrbitField } from "@/components/OrbitField";
import { Reveal } from "@/components/Reveal";
import { ButtonLink, Eyebrow, Section } from "@/components/ui";
import { getPublishedConsultantById } from "@/lib/db/queries";
import { resolveMediaUrl } from "@/lib/storage/media";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const consultant = await getPublishedConsultantById(id);
  if (!consultant) return { title: "Not found" };

  return {
    title: consultant.name,
    description:
      consultant.bio ??
      `${consultant.name} — consultant at Connectors.`,
  };
}

export default async function ConsultantProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const consultant = await getPublishedConsultantById(id);
  if (!consultant) notFound();

  const photo = await resolveMediaUrl(consultant.photoUrl);
  const experience = consultant.experience ?? [];
  const education = consultant.education ?? [];
  const [experienceUrls, educationUrls] = await Promise.all([
    Promise.all(experience.map((e) => resolveMediaUrl(e.attachment))),
    Promise.all(education.map((e) => resolveMediaUrl(e.attachment))),
  ]);

  const stats = [
    consultant.yearsExperience != null && {
      value: consultant.yearsExperience,
      label: "Years of experience",
    },
  ].filter((s): s is { value: number; label: string } => Boolean(s));

  return (
    <>
      {/* Cover — sits under the fixed header, so the content block carries
          its own top padding rather than relying on the image's height. */}
      <div className="relative h-[38vh] min-h-[18rem] w-full overflow-hidden bg-ink">
        <OrbitField
          count={30}
          strokeWidth={0.3}
          className="animate-orbit pointer-events-none absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 text-white/[0.08]"
        />
      </div>

      <Section className="!pt-0">
        {/* Identity card, pulled up over the cover. */}
        <div className="-mt-20 md:-mt-24">
          <Reveal>
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_32px_64px_-40px_rgba(20,20,26,0.4)] md:p-8">
              <div className="flex flex-wrap items-start gap-5">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- private signed Storage URL
                  <img
                    src={photo}
                    alt={consultant.name}
                    className="h-20 w-20 shrink-0 rounded-2xl border border-[var(--border)] object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-sunken)]">
                    <span className="font-display text-3xl text-[var(--muted)]">
                      {consultant.name.charAt(0)}
                    </span>
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="eyebrow text-violet-600">Consultant</p>
                  <h1 className="font-display display-md mt-2 text-balance">{consultant.name}</h1>
                  {consultant.expertise && consultant.expertise.length > 0 && (
                    <p className="mt-3 max-w-2xl text-sm text-violet-600">
                      {consultant.expertise.join(" · ")}
                    </p>
                  )}
                </div>

                <div className="shrink-0">
                  <ButtonLink href="#enquire">Enquire</ButtonLink>
                </div>
              </div>

              {stats.length > 0 && (
                <div className="mt-8 grid grid-cols-2 gap-6 border-t border-[var(--border)] pt-6 sm:grid-cols-3">
                  {stats.map((s) => (
                    <div key={s.label}>
                      <p className="font-display text-3xl text-violet-600">
                        {s.value.toLocaleString()}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        </div>

        {/* Body */}
        <div className="mt-14 grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          <div>
            {consultant.bio && (
              <Reveal>
                <Eyebrow>About</Eyebrow>
                <div className="mt-5 space-y-5">
                  {consultant.bio.split(/\n\s*\n/).map((para, i) => (
                    <p key={i} className="leading-relaxed text-[var(--muted)] text-pretty">
                      {para}
                    </p>
                  ))}
                </div>
              </Reveal>
            )}

            {consultant.expertise && consultant.expertise.length > 0 && (
              <Reveal i={1} className={consultant.bio ? "mt-14" : undefined}>
                <Eyebrow>Expertise</Eyebrow>
                <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {consultant.expertise.map((s) => (
                    <li key={s} className="flex items-start gap-2.5">
                      <Check size={16} className="mt-0.5 shrink-0 text-violet-600" />
                      <span className="text-[var(--muted)]">{s}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            {experience.length > 0 && (
              <Reveal i={2} className="mt-14">
                <Eyebrow>Experience</Eyebrow>
                <div className="mt-6 space-y-6">
                  {experience.map((e, i) => (
                    <div key={i} className="border-l-2 border-[var(--border)] pl-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <p className="font-medium">{e.title}</p>
                        <p className="text-xs text-[var(--muted)]">
                          {[e.yearFrom, e.yearTo].filter(Boolean).join(" – ")}
                        </p>
                      </div>
                      {e.description && (
                        <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)] text-pretty">
                          {e.description}
                        </p>
                      )}
                      {experienceUrls[i] && (
                        <a
                          href={experienceUrls[i]!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 text-xs text-violet-600 underline underline-offset-4"
                        >
                          <FileText size={12} /> View document
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </Reveal>
            )}

            {education.length > 0 && (
              <Reveal i={3} className="mt-14">
                <Eyebrow>Degrees &amp; certificates</Eyebrow>
                <div className="mt-6 space-y-6">
                  {education.map((e, i) => (
                    <div key={i} className="border-l-2 border-[var(--border)] pl-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <p className="font-medium">{e.title}</p>
                        <p className="text-xs text-[var(--muted)]">{e.year}</p>
                      </div>
                      {e.description && (
                        <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)] text-pretty">
                          {e.description}
                        </p>
                      )}
                      {educationUrls[i] && (
                        <a
                          href={educationUrls[i]!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 text-xs text-violet-600 underline underline-offset-4"
                        >
                          <FileText size={12} /> View document
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </Reveal>
            )}
          </div>

          {/* Sidebar — sticky on desktop so the enquiry form stays reachable
              through a long profile. */}
          <div id="enquire" className="lg:sticky lg:top-28 lg:self-start">
            <Reveal i={2}>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-sunken)] p-6">
                <h2 className="font-display text-lg">Enquire</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)] text-pretty">
                  Tell us what you're deciding and {consultant.name.split(" ")[0]} will follow up
                  directly.
                </p>
                <div className="mt-5">
                  <ConsultantInquiryForm
                    consultantId={consultant.id}
                    consultantName={consultant.name}
                  />
                </div>
              </div>
            </Reveal>
          </div>
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
