import { Check } from "lucide-react";
import { PhoneMockup } from "@/components/app/PhoneMockup";
import { OrbitField } from "@/components/OrbitField";
import { Reveal } from "@/components/Reveal";
import { ButtonLink } from "@/components/ui";
import { appModules, appPitch } from "@/lib/content/app";

/**
 * Homepage section for the franchise management app. Dark, so it reads as a
 * distinct product moment between the white marketing sections.
 */
export function AppShowcase() {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <OrbitField
        count={28}
        strokeWidth={0.25}
        className="animate-orbit pointer-events-none absolute -left-40 top-1/2 h-[36rem] w-[36rem] -translate-y-1/2 text-white/[0.06]"
      />

      <div className="shell relative py-20 md:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <Reveal>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-violet-200/70">
                {appPitch.eyebrow}
              </p>
            </Reveal>
            <Reveal i={1}>
              <h2 className="font-display display-lg mt-4 text-balance">
                {appPitch.title}
              </h2>
            </Reveal>
            <Reveal i={2}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/65 text-pretty">
                {appPitch.body}
              </p>
            </Reveal>

            {/* The same platform, two very different jobs. */}
            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              <Reveal i={3}>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">
                  Brands see
                </p>
                <ul className="mt-4 space-y-2.5">
                  {appPitch.brandView.map((line) => (
                    <li key={line} className="flex gap-2.5 text-sm text-white/70">
                      <Check
                        size={15}
                        className="mt-0.5 shrink-0 text-violet-200"
                      />
                      {line}
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal i={4}>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">
                  Franchisees see
                </p>
                <ul className="mt-4 space-y-2.5">
                  {appPitch.franchiseeView.map((line) => (
                    <li key={line} className="flex gap-2.5 text-sm text-white/70">
                      <Check
                        size={15}
                        className="mt-0.5 shrink-0 text-violet-200"
                      />
                      {line}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <Reveal i={5}>
              <div className="mt-10 flex flex-wrap gap-3">
                <ButtonLink href="/app" variant="onDark" size="lg">
                  Explore the app
                </ButtonLink>
                <ButtonLink href="/solutions/technology" variant="outline" size="lg">
                  Technology division
                </ButtonLink>
              </div>
            </Reveal>
          </div>

          <Reveal i={2} className="lg:justify-self-end">
            <PhoneMockup />
          </Reveal>
        </div>

        {/* Every module, named — the profile lists eleven and they are the
            substance of the offer, so they belong on the homepage. */}
        <Reveal i={1}>
          <div className="mt-16 flex flex-wrap gap-2 border-t border-white/10 pt-10">
            {appModules.map((module) => (
              <span
                key={module.slug}
                className="rounded-full border border-white/15 px-3.5 py-1.5 text-xs text-white/60 transition-colors hover:border-white/40 hover:text-white"
              >
                {module.name}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
