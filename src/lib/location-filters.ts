export const SIZE_BUCKETS: { value: string; label: string; test: (sqft: number | null) => boolean }[] = [
  { value: "under-2000", label: "Under 2,000 sq ft", test: (s) => s != null && s < 2000 },
  { value: "2000-5000", label: "2,000 – 5,000 sq ft", test: (s) => s != null && s >= 2000 && s < 5000 },
  { value: "5000-10000", label: "5,000 – 10,000 sq ft", test: (s) => s != null && s >= 5000 && s < 10000 },
  { value: "10000-plus", label: "10,000+ sq ft", test: (s) => s != null && s >= 10000 },
];

export type LocationFilters = {
  q?: string;
  status?: string;
  type?: string;
  city?: string;
  size?: string;
};

export function matchesLocationFilters(
  property: { title: string; city: string; area: string | null; status: string; propertyType: string; sizeSqft: number | null },
  filters: LocationFilters,
) {
  const q = filters.q?.trim().toLowerCase();
  if (q && !`${property.title} ${property.city} ${property.area ?? ""}`.toLowerCase().includes(q)) {
    return false;
  }
  if (filters.status && property.status !== filters.status) return false;
  if (filters.type && property.propertyType !== filters.type) return false;
  if (filters.city && property.city !== filters.city) return false;
  if (filters.size) {
    const bucket = SIZE_BUCKETS.find((b) => b.value === filters.size);
    if (bucket && !bucket.test(property.sizeSqft)) return false;
  }
  return true;
}
