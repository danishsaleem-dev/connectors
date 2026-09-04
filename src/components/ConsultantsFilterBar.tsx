"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ConsultantCard } from "@/components/ConsultantCard";
import { Reveal } from "@/components/Reveal";
import { ButtonLink, Input, Select } from "@/components/ui";

export type FilterableConsultant = {
  id: string;
  slug: string;
  name: string;
  photoUrl: string | null;
  industries: string[];
  expertise: string[];
};

const ALL = "";

/**
 * Client-side, not URL/searchParams-driven — the roster is small (a handful
 * of consultants today), so there's no pagination or SEO reason to round-trip
 * the server on every filter change. If the roster grows large enough that
 * shareable/bookmarkable filtered links matter, move this to searchParams.
 */
export function ConsultantsFilterBar({
  consultants,
  industries,
  expertise,
}: {
  consultants: FilterableConsultant[];
  industries: string[];
  expertise: string[];
}) {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState(ALL);
  const [area, setArea] = useState(ALL);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return consultants.filter((c) => {
      if (industry !== ALL && !c.industries.includes(industry)) return false;
      if (area !== ALL && !c.expertise.includes(area)) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.industries.some((i) => i.toLowerCase().includes(q)) ||
        c.expertise.some((e) => e.toLowerCase().includes(q))
      );
    });
  }, [consultants, query, industry, area]);

  const hasFilters = query.trim() !== "" || industry !== ALL || area !== ALL;

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search consultants…"
            className="pl-10"
            aria-label="Search consultants"
          />
        </div>
        <Select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          aria-label="Filter by industry"
        >
          <option value={ALL}>All industries</option>
          {industries.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </Select>
        <Select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          aria-label="Filter by expertise"
        >
          <option value={ALL}>All expertise</option>
          {expertise.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-8">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] px-8 py-16 text-center">
            <p className="font-display text-xl">No consultants match those filters.</p>
            <p className="mx-auto mt-3 max-w-md leading-relaxed text-[var(--muted)] text-pretty">
              Try a different search, or tell us what you need and we&rsquo;ll match you with
              the right person directly.
            </p>
            <div className="mt-8 flex justify-center">
              <ButtonLink href="/contact">Hire a Consultant</ButtonLink>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c, i) => (
              <Reveal key={c.id} i={hasFilters ? 0 : i % 3}>
                <ConsultantCard slug={c.slug} name={c.name} photoUrl={c.photoUrl} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
