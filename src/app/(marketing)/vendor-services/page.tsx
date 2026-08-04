import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { VendorCta } from "@/components/VendorCta";
import { ButtonLink, Eyebrow, Section } from "@/components/ui";
import { vendorServices } from "@/lib/content/vendor-services";
import { photos } from "@/lib/images";

export const metadata: Metadata = {
  title: "Vendor Services",
  description:
    "Every discipline the Connectors Partners Program covers — design, build, training and the operational services a growing network needs.",
};

export default function VendorServicesPage() {
  return (
    <>
      {/* Full-bleed photo banner — same treatment as the homepage hero. */}
      <section className="relative isolate overflow-hidden">
        <div className="relative flex min-h-[28rem] flex-col justify-end sm:min-h-[36rem]">
          <div className="absolute inset-0">
            <Photo
              photo={photos.office}
              sizes="100vw"
              aspect="none"
              className="h-full"
              priority
              overlay="strong"
            />
          </div>
          <div className="shell relative pb-10 pt-28 sm:pb-14 sm:pt-32">
            <Reveal>
              <Eyebrow className="text-white/55">Vendor Services</Eyebrow>
            </Reveal>
            <Reveal i={1}>
              <h1 className="font-display display-lg mt-4 max-w-3xl text-balance text-white">
                Every discipline an opening needs, in one program.
              </h1>
            </Reveal>
            <Reveal i={2}>
              <p className="mt-5 max-w-xl leading-relaxed text-white/70 text-pretty">
                From the first concept drawing to the training that runs day
                one — the full bench our Partners Program brings to a brand's
                expansion.
              </p>
            </Reveal>
            <Reveal i={3}>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="#services" variant="onDark" size="lg">
                  Explore the services
                </ButtonLink>
                <ButtonLink href="/become-a-vendor" variant="outline" size="lg">
                  Join as a vendor
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Section id="services" tone="sunken">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>What we cover</Eyebrow>
          </Reveal>
          <Reveal i={1}>
            <h2 className="font-display display-lg mt-4 text-balance">
              The bench behind every opening.
            </h2>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vendorServices.map((service, i) => {
            const Icon = service.icon;
            return (
              <Reveal key={service.slug} i={i % 3}>
                <Link
                  href={`/vendor-services/${service.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-all hover:border-violet-400 hover:shadow-[0_28px_56px_-32px_rgba(20,20,26,0.3)]"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Icon size={20} />
                  </span>
                  <h3 className="font-display mt-5 text-lg">{service.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[var(--muted)] text-pretty">
                    {service.body}
                  </p>
                  <span className="mt-auto flex items-center gap-1.5 pt-5 text-sm text-violet-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Explore service
                    <ArrowUpRight size={15} />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <VendorCta
        title="Are you a vendor? Join the Connectors community."
        body="No fee to join, no subscription to stay. We introduce our partners with the brief already in hand, across every discipline on this page."
      />
    </>
  );
}
