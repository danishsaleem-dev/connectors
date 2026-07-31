import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { CtaSection } from "@/components/CtaSection";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { Eyebrow, Section } from "@/components/ui";
import { divisions, getDivision } from "@/lib/content/divisions";
import { photos, type Photo as PhotoData } from "@/lib/images";
import { breadcrumbLd, serviceLd } from "@/lib/seo";
import { audiences } from "@/lib/site";

const DIVISION_PHOTOS: Record<string, PhotoData> = {
  "brand-expansion": photos.boutique,
  "franchise-development": photos.restaurant,
  "investor-connections": photos.boardroom,
  "mall-projects": photos.mall,
  "landlord-services": photos.towers,
  "marketing-branding": photos.analytics,
  technology: photos.datacentre,
};

export function generateStaticParams() {
  return divisions.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const division = getDivision(slug);
  if (!division) return {};
  return {
    title: division.title,
    description: division.lead,
    alternates: { canonical: `/solutions/${division.slug}` },
  };
}

export default async function DivisionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const division = getDivision(slug);
  if (!division) notFound();

  const relevantAudiences = audiences.filter((a) =>
    division.audiences.includes(a.slug),
  );
  const photo = DIVISION_PHOTOS[division.slug] ?? photos.office;

  return (
    <>
      <JsonLd
        data={[
          serviceLd({
            name: division.title,
            description: division.lead,
            slug: division.slug,
          }),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Solutions", path: "/solutions" },
            { name: division.title, path: `/solutions/${division.slug}` },
          ]),
        ]}
      />

      <Section className="pt-32 md:pt-40">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div>
            <Reveal>
              <Eyebrow>Division {division.index}</Eyebrow>
            </Reveal>
            <Reveal i={1}>
              <h1 className="font-display display-xl mt-5 text-balance">
                {division.title}
              </h1>
            </Reveal>
            <Reveal i={2}>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-[var(--muted)] text-pretty">
                {division.lead}
              </p>
            </Reveal>

            {relevantAudiences.length > 0 && (
              <Reveal i={3}>
                <div className="mt-8 flex flex-wrap gap-3">
                  {relevantAudiences.map((a) => (
                    <Link
                      key={a.slug}
                      href={`/${a.slug}`}
                      className="rounded-full border border-[var(--border)] px-4 py-2 text-sm transition-colors hover:border-violet-400 hover:text-violet-600"
                    >
                      For {a.title.toLowerCase()}
                    </Link>
                  ))}
                </div>
              </Reveal>
            )}
          </div>

          <Reveal i={1}>
            <Photo
              photo={photo}
              sizes="(min-width: 1024px) 38vw, 100vw"
              aspect="portrait"
              className="rounded-2xl"
              priority
            />
          </Reveal>
        </div>
      </Section>

      <Section tone="sunken">
        <Reveal>
          <Eyebrow>What's included</Eyebrow>
        </Reveal>
        <Reveal i={1}>
          <h2 className="font-display display-lg mt-4 max-w-xl text-balance">
            The full service list.
          </h2>
        </Reveal>

        <ul className="mt-12 grid gap-x-10 gap-y-1 sm:grid-cols-2">
          {division.services.map((service, i) => (
            <Reveal as="li" key={service} i={i % 6}>
              <div className="flex items-start gap-3 border-b border-[var(--border)] py-4">
                <Check size={16} className="mt-0.5 shrink-0 text-violet-600" />
                <span className="text-[15px] leading-relaxed">{service}</span>
              </div>
            </Reveal>
          ))}
        </ul>
      </Section>

      {division.panels && division.panels.length > 0 && (
        <Section>
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
            {division.panels.map((panel, pi) => (
              <div key={panel.title}>
                <Reveal i={pi}>
                  <h2 className="font-display text-2xl">{panel.title}</h2>
                </Reveal>
                <Reveal i={pi + 1}>
                  <div className="mt-6 flex flex-wrap gap-2.5">
                    {panel.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--muted)]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </Section>
      )}

      <CtaSection
        photo={photo}
        secondary={{ href: "/solutions", label: "View all divisions" }}
      />
    </>
  );
}
