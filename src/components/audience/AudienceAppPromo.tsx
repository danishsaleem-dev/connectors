import { Apple, Play } from "lucide-react";
import { PhoneMockup } from "@/components/app/PhoneMockup";
import { StoreBadge } from "@/components/app/StoreBadge";
import { Marquee } from "@/components/Marquee";
import { OrbitField } from "@/components/OrbitField";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/ui";
import { appModules } from "@/lib/content/app";
import { site, type AudienceSlug } from "@/lib/site";

type PromoCopy = {
  eyebrow: string;
  title: string;
  body: string;
  tags: string[];
  moduleAudience: "brand" | "franchisee" | "both" | "all";
};

const COPY: Record<AudienceSlug, PromoCopy> = {
  "for-brands": {
    eyebrow: "The Connectors app",
    title: "Run your whole expansion from your phone.",
    body: "Every location, every franchise applicant and every agreement — live, from wherever you're standing. The same platform that runs your network after it opens.",
    tags: ["Network view, every location", "Franchise pipeline, live"],
    moduleAudience: "brand",
  },
  "for-franchise": {
    eyebrow: "The Connectors app",
    title: "Everything you need to operate, in your pocket.",
    body: "Training, onboarding, manuals and a direct line to head office — the whole path from signed to open, and everything after, in one app.",
    tags: ["Onboarding, step by step", "Direct line to support"],
    moduleAudience: "franchisee",
  },
  "for-landlords": {
    eyebrow: "The Connectors app",
    title: "The platform behind every brand we place.",
    body: "The same system that runs franchise compliance and reporting across our network is what keeps a tenant accountable to the lease you signed.",
    tags: ["Compliance, tracked per unit", "Audit reporting, built in"],
    moduleAudience: "both",
  },
  "for-investors": {
    eyebrow: "The Connectors app",
    title: "The reporting layer behind every opportunity.",
    body: "Royalty, revenue and compliance data across the network — the same operating discipline we point to when we say an opportunity is verified.",
    tags: ["Royalty & revenue reporting", "Audit & compliance, tracked"],
    moduleAudience: "both",
  },
};

/**
 * Mobile app section for the audience pages — deliberately distinct from the
 * homepage's <AppShowcase>: a single floating card rather than a full-bleed
 * dark section, a per-audience angle on the same product, and real store
 * buttons instead of a single "Explore the app" link.
 */
export function AudienceAppPromo({ audience }: { audience: AudienceSlug }) {
  const copy = COPY[audience];
  const modules =
    copy.moduleAudience === "all"
      ? appModules
      : appModules.filter(
          (m) => m.audience === copy.moduleAudience || m.audience === "both",
        );

  return (
    <Section>
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-700 via-violet-900 to-ink px-6 py-16 sm:px-10 md:px-14 md:py-20">
        <OrbitField
          count={24}
          strokeWidth={0.25}
          className="animate-orbit pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] text-white/[0.07]"
        />

        <div className="relative grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <Reveal>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-violet-200/70">
                {copy.eyebrow}
              </p>
            </Reveal>
            <Reveal i={1}>
              <h2 className="font-display display-lg mt-4 text-balance text-white">
                {copy.title}
              </h2>
            </Reveal>
            <Reveal i={2}>
              <p className="mt-5 max-w-lg leading-relaxed text-white/70 text-pretty">
                {copy.body}
              </p>
            </Reveal>

            <Reveal i={3}>
              <div className="mt-9 flex flex-wrap gap-3">
                <StoreBadge
                  href={site.appLinks.ios}
                  icon={<Apple size={22} />}
                  eyebrow="Download on the"
                  label="App Store"
                />
                <StoreBadge
                  href={site.appLinks.android}
                  icon={<Play size={18} className="fill-current" />}
                  eyebrow="Get it on"
                  label="Google Play"
                />
              </div>
            </Reveal>
          </div>

          <Reveal i={2} className="relative mx-auto lg:justify-self-end">
            <div className="animate-float">
              <PhoneMockup />
            </div>

            {/* Solid fill, not translucent — these sit over the phone's own
                white screen as often as over the dark gradient, and a
                backdrop-blur pill picks up whatever's behind it, which
                washed white text out to near-invisible over the screen. */}
            <div
              aria-hidden="true"
              className="absolute -left-6 top-10 hidden rounded-xl border border-white/10 bg-ink px-3.5 py-2.5 text-xs font-medium text-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] sm:block"
            >
              {copy.tags[0]}
            </div>
            <div
              aria-hidden="true"
              className="absolute -right-4 bottom-16 hidden rounded-xl border border-white/10 bg-ink px-3.5 py-2.5 text-xs font-medium text-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] sm:block"
            >
              {copy.tags[1]}
            </div>
          </Reveal>
        </div>

        <div className="relative mt-14 border-t border-white/10 pt-8">
          <Marquee duration="32s">
            {modules.map((module) => (
              <span
                key={module.slug}
                className="mx-5 whitespace-nowrap text-sm text-white/50"
              >
                {module.name}
                <span className="ml-5 text-violet-200/40">·</span>
              </span>
            ))}
          </Marquee>
        </div>
      </div>
    </Section>
  );
}
