import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Globe, Mail, MapPin, Phone } from "lucide-react";
import { OrbitField } from "@/components/OrbitField";
import { Reveal } from "@/components/Reveal";
import { ButtonLink, Eyebrow, Section } from "@/components/ui";
import { getPublishedVendorBySlug } from "@/lib/db/queries";
import { VENDOR_DISCIPLINE_LABEL } from "@/lib/portal/domain";
import { resolveMediaUrl } from "@/lib/storage/media";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vendor = await getPublishedVendorBySlug(slug);
  if (!vendor) return { title: "Not found" };

  return {
    title: vendor.name,
    description:
      vendor.headline ??
      `${vendor.name} — ${VENDOR_DISCIPLINE_LABEL[vendor.discipline] ?? "partner"} in the Connectors Partners Program.`,
  };
}

export default async function ConsultantProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vendor = await getPublishedVendorBySlug(slug);
  if (!vendor) notFound();

  const [logo, cover] = await Promise.all([
    resolveMediaUrl(vendor.logoUrl),
    resolveMediaUrl(vendor.coverUrl),
  ]);

  const stats = [
    vendor.yearsExperience != null && { value: vendor.yearsExperience, label: "Years in business" },
    vendor.projectsCompleted != null && { value: vendor.projectsCompleted, label: "Projects delivered" },
    vendor.teamSize != null && { value: vendor.teamSize, label: "People on the team" },
  ].filter((s): s is { value: number; label: string } => Boolean(s));

  return (
    <>
      {/* Cover — sits under the fixed header, so the content block carries
          its own top padding rather than relying on the image's height. */}
      <div className="relative h-[38vh] min-h-[18rem] w-full overflow-hidden bg-ink">
        {cover ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- private signed Storage URL */}
            <img src={cover} alt="" className="h-full w-full object-cover" />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/30"
            />
          </>
        ) : (
          <OrbitField
            count={30}
            strokeWidth={0.3}
            className="animate-orbit pointer-events-none absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 text-white/[0.08]"
          />
        )}
      </div>

      <Section className="!pt-0">
        {/* Identity card, pulled up over the cover. */}
        <div className="-mt-20 md:-mt-24">
          <Reveal>
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_32px_64px_-40px_rgba(20,20,26,0.4)] md:p-8">
              <div className="flex flex-wrap items-start gap-5">
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- private signed Storage URL
                  <img
                    src={logo}
                    alt={`${vendor.name} logo`}
                    className="h-20 w-20 shrink-0 rounded-2xl border border-[var(--border)] bg-white object-contain p-2"
                  />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-sunken)]">
                    <span className="font-display text-3xl text-[var(--muted)]">
                      {vendor.name.charAt(0)}
                    </span>
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="eyebrow text-violet-600">
                    {VENDOR_DISCIPLINE_LABEL[vendor.discipline] ?? vendor.discipline}
                  </p>
                  <h1 className="font-display display-md mt-2 text-balance">{vendor.name}</h1>
                  {vendor.headline && (
                    <p className="mt-3 max-w-2xl leading-relaxed text-[var(--muted)] text-pretty">
                      {vendor.headline}
                    </p>
                  )}
                </div>

                <div className="shrink-0">
                  <ButtonLink href="/contact">Work with them</ButtonLink>
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
            {vendor.bio && (
              <Reveal>
                <Eyebrow>About</Eyebrow>
                <div className="mt-5 space-y-5">
                  {vendor.bio.split(/\n\s*\n/).map((para, i) => (
                    <p key={i} className="leading-relaxed text-[var(--muted)] text-pretty">
                      {para}
                    </p>
                  ))}
                </div>
              </Reveal>
            )}

            {vendor.specialties && vendor.specialties.length > 0 && (
              <Reveal i={1} className={vendor.bio ? "mt-14" : undefined}>
                <Eyebrow>Specialties</Eyebrow>
                <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {vendor.specialties.map((s) => (
                    <li key={s} className="flex items-start gap-2.5">
                      <Check size={16} className="mt-0.5 shrink-0 text-violet-600" />
                      <span className="text-[var(--muted)]">{s}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>

          {/* Sidebar — sticky on desktop so contact details stay reachable
              through a long bio. */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal i={2}>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-sunken)] p-6">
                <h2 className="font-display text-lg">Details</h2>

                <dl className="mt-5 space-y-4 text-sm">
                  {vendor.citiesServed && vendor.citiesServed.length > 0 && (
                    <div className="flex gap-3">
                      <MapPin size={16} className="mt-0.5 shrink-0 text-violet-600" />
                      <div>
                        <dt className="text-[var(--muted)]">Cities served</dt>
                        <dd className="mt-0.5">{vendor.citiesServed.join(", ")}</dd>
                      </div>
                    </div>
                  )}
                  {vendor.country && (
                    <div className="flex gap-3">
                      <Globe size={16} className="mt-0.5 shrink-0 text-violet-600" />
                      <div>
                        <dt className="text-[var(--muted)]">Based in</dt>
                        <dd className="mt-0.5">{vendor.country}</dd>
                      </div>
                    </div>
                  )}
                  {vendor.website && (
                    <div className="flex gap-3">
                      <Globe size={16} className="mt-0.5 shrink-0 text-violet-600" />
                      <div className="min-w-0">
                        <dt className="text-[var(--muted)]">Website</dt>
                        <dd className="mt-0.5 truncate">
                          <a
                            href={vendor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-violet-600 underline underline-offset-4"
                          >
                            {vendor.website.replace(/^https?:\/\//, "")}
                          </a>
                        </dd>
                      </div>
                    </div>
                  )}
                  {vendor.contactEmail && (
                    <div className="flex gap-3">
                      <Mail size={16} className="mt-0.5 shrink-0 text-violet-600" />
                      <div className="min-w-0">
                        <dt className="text-[var(--muted)]">Email</dt>
                        <dd className="mt-0.5 truncate">
                          <a
                            href={`mailto:${vendor.contactEmail}`}
                            className="text-violet-600 underline underline-offset-4"
                          >
                            {vendor.contactEmail}
                          </a>
                        </dd>
                      </div>
                    </div>
                  )}
                  {vendor.phone && (
                    <div className="flex gap-3">
                      <Phone size={16} className="mt-0.5 shrink-0 text-violet-600" />
                      <div>
                        <dt className="text-[var(--muted)]">Phone</dt>
                        <dd className="mt-0.5">{vendor.phone}</dd>
                      </div>
                    </div>
                  )}
                </dl>

                <div className="mt-6 border-t border-[var(--border)] pt-6">
                  <p className="text-sm leading-relaxed text-[var(--muted)] text-pretty">
                    Introductions to Partners Program members go through the
                    Connectors team, so the brief and scope arrive with them.
                  </p>
                  <div className="mt-4">
                    <ButtonLink href="/contact" variant="secondary" size="sm">
                      Request an introduction
                    </ButtonLink>
                  </div>
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
            Back to the directory
          </Link>
        </div>
      </Section>
    </>
  );
}
