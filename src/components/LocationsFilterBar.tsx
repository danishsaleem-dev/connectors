"use client";

import { useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Field, Input, Select } from "@/components/ui";
import { SIZE_BUCKETS, type LocationFilters } from "@/lib/location-filters";
import { PROPERTY_STATUS_LABEL, PROPERTY_TYPE_LABEL } from "@/lib/portal/domain";

const SEARCH_DEBOUNCE_MS = 350;

/** Every change navigates immediately — selects on their change event, the
 * search box debounced so it doesn't push a new URL per keystroke. The
 * actual filtering happens server-side in matchesLocationFilters (a plain
 * module, not this one, so the Server Component page can still call it —
 * "use client" here would otherwise drag that function along too). */
export function LocationsFilterBar({
  cities,
  filters,
}: {
  cities: string[];
  filters: LocationFilters;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function setParam(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    router.push(params.size ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
  }

  function onSearchChange(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setParam("q", value), SEARCH_DEBOUNCE_MS);
  }

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="mb-10 grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_20px_48px_-32px_rgba(20,20,26,0.25)] sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto] lg:items-end lg:gap-4">
      <Field label="Search" className="lg:col-span-1">
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />
          <Input
            defaultValue={filters.q}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title or area…"
            className="pl-9"
          />
        </div>
      </Field>

      <Field label="Availability">
        <Select
          defaultValue={filters.status ?? ""}
          onChange={(e) => setParam("status", e.target.value)}
        >
          <option value="">All</option>
          {Object.entries(PROPERTY_STATUS_LABEL)
            .filter(([value]) => value !== "withdrawn")
            .map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
        </Select>
      </Field>

      <Field label="Type">
        <Select defaultValue={filters.type ?? ""} onChange={(e) => setParam("type", e.target.value)}>
          <option value="">All types</option>
          {Object.entries(PROPERTY_TYPE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Size">
        <Select defaultValue={filters.size ?? ""} onChange={(e) => setParam("size", e.target.value)}>
          <option value="">Any size</option>
          {SIZE_BUCKETS.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="City">
        <Select defaultValue={filters.city ?? ""} onChange={(e) => setParam("city", e.target.value)}>
          <option value="">All cities</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </Select>
      </Field>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => router.push(pathname, { scroll: false })}
          className="flex items-center justify-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--muted)] transition-colors hover:border-violet-400 hover:text-violet-600 lg:w-auto"
        >
          <X size={14} /> Clear
        </button>
      )}
    </div>
  );
}
