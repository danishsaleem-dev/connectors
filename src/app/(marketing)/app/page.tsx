import type { Metadata } from "next";
import {
  Apple,
  BookOpen,
  Check,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  Library,
  Megaphone,
  Play,
  Receipt,
  Rocket,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { PhoneMockup } from "@/components/app/PhoneMockup";
import { StoreBadge } from "@/components/app/StoreBadge";
import { CtaSection } from "@/components/CtaSection";
import { OrbitField } from "@/components/OrbitField";
import { Reveal } from "@/components/Reveal";
import { Eyebrow, Section } from "@/components/ui";
import { appModules, appPitch } from "@/lib/content/app";
import { photos } from "@/lib/images";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "The App",
  description:
    "The Connectors app: franchise sales, onboarding, training, compliance, support and royalty management — one platform for brands and franchisees.",
  alternates: { canonical: "/app" },
};

const MODULE_ICONS: Record<string, LucideIcon> = {
  Workflow,
  GraduationCap,
  Megaphone,
  Library,
  LayoutDashboard,
  Rocket,
  BookOpen,
  ClipboardCheck,
  LifeBuoy,
  Receipt,
  Users,
};

export default function AppPage() {
  return (
    <>
      {/* ---------------------------------------------------------- */}
      {/*  Hero                                                        */}
      {/* ---------------------------------------------------------- */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <OrbitField
          count={30}
          strokeWidth={0.25}
          className="animate-orbit pointer-events-none absolute -left-52 top-1/3 h-[42rem] w-[42rem] text-white/[0.06]"
        />

        <div className="shell relative pb-16 pt-36 md:pb-24 md:pt-44">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <div>
              <Reveal>
                <Eyebrow className="text-white/55">{appPitch.eyebrow}</Eyebrow>
              </Reveal>
              <Reveal i={1}>
                <h1 className="font-display display-xl mt-5 text-balance">
                  {appPitch.title}
                </h1>
              </Reveal>
              <Reveal i={2}>
                <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/70 text-pretty">
                  {appPitch.body}
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

            <Reveal i={2} className="mx-auto lg:justify-self-end">
              <div className="animate-float">
                <PhoneMockup />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  Two views of the same platform                              */}
      {/* ---------------------------------------------------------- */}
      <Section>
        <Reveal>
          <Eyebrow>One app, two jobs</Eyebrow>
        </Reveal>
        <Reveal i={1}>
          <h2 className="font-display display-lg mt-4 max-w-xl text-balance">
            Brands run the network. Franchisees run their location.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-8 sm:grid-cols-2">
          <Reveal i={2} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h3 className="font-display text-2xl">Brands see</h3>
            <ul className="mt-6 space-y-3">
              {appPitch.brandView.map((line) => (
                <li key={line} className="flex gap-3 text-sm leading-relaxed text-[var(--muted)]">
                  <Check size={16} className="mt-0.5 shrink-0 text-violet-600" />
                  {line}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal i={3} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h3 className="font-display text-2xl">Franchisees see</h3>
            <ul className="mt-6 space-y-3">
              {appPitch.franchiseeView.map((line) => (
                <li key={line} className="flex gap-3 text-sm leading-relaxed text-[var(--muted)]">
                  <Check size={16} className="mt-0.5 shrink-0 text-violet-600" />
                  {line}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      {/* ---------------------------------------------------------- */}
      {/*  Every module                                                */}
      {/* ---------------------------------------------------------- */}
      <Section tone="sunken">
        <Reveal>
          <Eyebrow>The full platform</Eyebrow>
        </Reveal>
        <Reveal i={1}>
          <h2 className="font-display display-lg mt-4 max-w-xl text-balance">
            Eleven modules. One franchise network.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {appModules.map((module, i) => {
            const Icon = MODULE_ICONS[module.icon] ?? Workflow;
            return (
              <Reveal
                key={module.slug}
                i={i % 3}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Icon size={18} />
                </span>
                <h3 className="font-display mt-4 text-lg leading-snug">
                  {module.name}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[var(--muted)]">
                  {module.body}
                </p>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <CtaSection
        photo={photos.datacentre}
        eyebrow="Get the app"
        title="Ask us for early access."
        body="The app rolls out alongside every brand and franchisee we onboard. Tell us where you are in the process and we'll get you set up."
        secondary={{ href: "/solutions/technology", label: "Technology division" }}
      />
    </>
  );
}
