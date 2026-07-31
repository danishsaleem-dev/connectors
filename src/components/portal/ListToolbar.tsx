import { Button, Field, Input, Select } from "@/components/ui";

/**
 * Search + optional status filter for a listing page. A plain GET form —
 * the page itself is a Server Component reading `searchParams`, so filtering
 * a list needs no client JS at all: submitting just navigates to
 * `?q=…&status=…`, which the page re-renders filtered.
 */
export function ListToolbar({
  action,
  placeholder = "Search…",
  query,
  statusOptions,
  statusValue,
}: {
  action: string;
  placeholder?: string;
  query?: string;
  statusOptions?: { value: string; label: string }[];
  statusValue?: string;
}) {
  return (
    <form action={action} className="mb-6 flex flex-wrap items-end gap-3">
      <Field label="Search" className="min-w-48 flex-1">
        <Input name="q" defaultValue={query} placeholder={placeholder} />
      </Field>
      {statusOptions && (
        <Field label="Status" className="w-44">
          <Select name="status" defaultValue={statusValue ?? ""}>
            <option value="">All</option>
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
      )}
      <Button type="submit" variant="secondary" size="md" showIcon={false}>
        Filter
      </Button>
    </form>
  );
}

/** Case-insensitive substring match across whichever fields apply to a row —
 * used the same way on every listing page rather than re-writing it five times. */
export function matchesQuery(query: string | undefined, ...fields: (string | null | undefined)[]) {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => f?.toLowerCase().includes(q));
}
