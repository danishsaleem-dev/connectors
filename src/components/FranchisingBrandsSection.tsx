import { clsx } from "clsx";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Eyebrow, Section } from "@/components/ui";
import { formatRange } from "@/components/portal/ui";
import { listFranchisingBrands } from "@/lib/db/queries";
import { resolveMediaUrl } from "@/lib/storage/media";

type Brand = Awaited<ReturnType<typeof listFranchisingBrands>>[number] & { logo: string | null };

/** Brands currently flagged as actively franchising (see listFranchisingBrands
 * for the gate), filterable by industry via pill chips — plain links with a
 * query param, same pattern as the old vendor-discipline filter, so every
 * view is a Server Component and a shareable URL. */
export async function FranchisingBrandsSection({ industry }: { industry?: string }) {
  const allBrands = await listFranchisingBrands();
  const categories = [...new Set(allBrands.map((b) => b.industry).filter((v): v is string => Boolean(v)))].sort();
  const active = industry && categories.includes(industry) ? industry : undefined;
  const filtered = active ? allBrands.filter((b) => b.industry === active) : allBrands;

  const brands = await Promise.all(
    filtered.map(async (b) => ({ ...b, logo: await resolveMediaUrl(b.logoUrl) })),
  );

  return (
    <Section id="brands" tone="sunken">
      <div className="max-w-2xl">
        <Reveal>
          <Eyebrow>Actively franchising</Eyebrow>
        </Reveal>
        <Reveal i={1}>
          <h2 className="font-display display-lg mt-4 text-balance">
            Brands ready to grow with a franchisee like you.
          </h2>
        </Reveal>
      </div>

      {categories.length > 0 && (
        <Reveal i={2}>
          <div className="mt-8 flex flex-wrap gap-2">
            <FilterChip href="/for-franchise#brands" label="All" active={!active} />
            {categories.map((c) => (
              <FilterChip
                key={c}
                href={`/for-franchise?industry=${encodeURIComponent(c)}#brands`}
                label={c}
                active={active === c}
              />
            ))}
          </div>
        </Reveal>
      )}

      <div className="mt-10">
        {brands.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] px-8 py-16 text-center">
            <p className="font-display text-xl">
              {active ? `No ${active.toLowerCase()} brands listed yet.` : "The list is being finalised."}
            </p>
            <p className="mx-auto mt-3 max-w-md leading-relaxed text-[var(--muted)] text-pretty">
              Apply below and we'll match you directly as new brands come on.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {brands.map((b, i) => (
              <Reveal key={b.organizationId} i={i % 3}>
                <BrandCard brand={b} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}

function BrandCard({ brand }: { brand: Brand }) {
  const investment = formatRange(brand.franchiseInvestmentMin, brand.franchiseInvestmentMax, brand.currency);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-all hover:border-violet-400 hover:shadow-[0_28px_56px_-32px_rgba(20,20,26,0.3)]">
      <div className="flex items-start gap-4">
        {brand.logo ? (
          // eslint-disable-next-line @next/next/no-img-element -- private signed Storage URL
          <img
            src={brand.logo}
            alt={brand.name}
            className="h-12 w-12 shrink-0 rounded-xl border border-[var(--border)] bg-white object-contain p-1.5"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-sunken)]">
            <Building2 size={18} className="text-[var(--muted)]" />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-display truncate text-lg">{brand.name}</h3>
          {brand.industry && <p className="mt-0.5 text-sm text-violet-600">{brand.industry}</p>}
        </div>
      </div>

      {brand.description && (
        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-[var(--muted)] text-pretty">
          {brand.description}
        </p>
      )}

      <div className="mt-auto flex flex-wrap gap-x-5 gap-y-1.5 border-t border-[var(--border)] pt-4 text-xs text-[var(--muted)]">
        {investment && <span>{investment} investment</span>}
        {brand.outletCount != null && (
          <span>
            {brand.outletCount} outlet{brand.outletCount === 1 ? "" : "s"}
          </span>
        )}
        {brand.country && <span>{brand.country}</span>}
      </div>
    </div>
  );
}

function FilterChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={clsx(
        "rounded-full border px-4 py-2 text-sm transition-colors",
        active
          ? "border-violet-600 bg-violet-600 text-white"
          : "border-[var(--border)] text-[var(--muted)] hover:border-violet-400 hover:text-violet-600",
      )}
    >
      {label}
    </Link>
  );
}
