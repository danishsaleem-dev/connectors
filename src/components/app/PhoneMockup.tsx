import { clsx } from "clsx";
import {
  ArrowUpRight,
  BookOpen,
  Building2,
  Home,
  LifeBuoy,
  TrendingUp,
} from "lucide-react";
import { OrbitField } from "@/components/OrbitField";

/**
 * An illustrative mockup of the Connectors franchise app — built in CSS rather
 * than shipped as a screenshot so it stays sharp at any size, inherits the
 * design tokens, and can be updated when the real product UI changes.
 *
 * The figures shown are illustrative sample data, not a real account.
 */
export function PhoneMockup({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "relative mx-auto w-[17rem] shrink-0 sm:w-[19rem]",
        className,
      )}
      aria-hidden="true"
    >
      {/* Device body */}
      <div className="relative rounded-[2.75rem] bg-ink p-2.5 shadow-[0_50px_90px_-40px_rgba(0,0,0,0.75)] ring-1 ring-white/10">
        {/* aspect-[9/19] holds true phone proportions regardless of how much
            sample content sits inside; the body below flexes to fill. */}
        <div className="relative flex aspect-[9/19] flex-col overflow-hidden rounded-[2.25rem] bg-white">
          {/* Notch */}
          <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-ink" />

          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pb-2 pt-3.5 text-[10px] font-medium text-ink">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-3.5 rounded-[2px] border border-ink/60" />
            </span>
          </div>

          {/* App bar */}
          <div className="flex items-center justify-between px-5 pb-4 pt-1">
            <div className="flex items-center gap-2">
              <OrbitField count={10} strokeWidth={1} className="h-5 w-5 text-violet-600" />
              <span className="font-display text-[13px] uppercase tracking-[0.16em] text-ink">
                Connectors
              </span>
            </div>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-50 text-[10px] font-medium text-violet-600">
              AK
            </span>
          </div>

          {/* Body */}
          <div className="flex-1 space-y-3 bg-grey-50 px-4 pb-4 pt-4">
            <p className="px-1 text-[11px] text-grey-500">Network overview</p>

            <div className="grid grid-cols-2 gap-2.5">
              <Tile
                label="Active locations"
                value="34"
                delta="+3 this quarter"
                icon={<Building2 size={13} />}
              />
              <Tile
                label="Pipeline"
                value="12"
                delta="4 in due diligence"
                icon={<TrendingUp size={13} />}
              />
            </div>

            <div className="rounded-xl border border-grey-200 bg-white p-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-ink">Locations</p>
                <ArrowUpRight size={12} className="text-grey-300" />
              </div>
              <div className="mt-2.5 space-y-2.5">
                <Row city="London — Mayfair" status="Open" tone="open" />
                <Row city="Lahore — Gulberg" status="Fit-out" tone="progress" />
                <Row city="Las Vegas — S Maryland" status="Training" tone="progress" />
              </div>
            </div>

            <div className="rounded-xl border border-grey-200 bg-white p-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-50 text-violet-600">
                  <BookOpen size={12} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium text-ink">
                    Onboarding: module 3
                  </p>
                  <p className="text-[10px] text-grey-500">Brand standards</p>
                </div>
              </div>
              <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-grey-200">
                <div className="h-full w-2/3 rounded-full bg-violet-600" />
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex items-center justify-around border-t border-grey-200 bg-white px-4 py-3">
            <Tab icon={<Home size={15} />} label="Home" active />
            <Tab icon={<Building2 size={15} />} label="Network" />
            <Tab icon={<BookOpen size={15} />} label="Training" />
            <Tab icon={<LifeBuoy size={15} />} label="Support" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Tile({
  label,
  value,
  delta,
  icon,
}: {
  label: string;
  value: string;
  delta: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-grey-200 bg-white p-3">
      <span className="flex items-center gap-1.5 text-[10px] text-grey-500">
        {icon}
        {label}
      </span>
      <p className="font-display mt-1.5 text-2xl leading-none text-ink">{value}</p>
      <p className="mt-1.5 text-[9px] text-grey-500">{delta}</p>
    </div>
  );
}

function Row({
  city,
  status,
  tone,
}: {
  city: string;
  status: string;
  tone: "open" | "progress";
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="truncate text-[10.5px] text-ink">{city}</span>
      <span
        className={clsx(
          "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-medium",
          tone === "open"
            ? "bg-violet-50 text-violet-600"
            : "bg-grey-100 text-grey-500",
        )}
      >
        {status}
      </span>
    </div>
  );
}

function Tab({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <span
      className={clsx(
        "flex flex-col items-center gap-1 text-[8.5px]",
        active ? "text-violet-600" : "text-grey-300",
      )}
    >
      {icon}
      {label}
    </span>
  );
}
