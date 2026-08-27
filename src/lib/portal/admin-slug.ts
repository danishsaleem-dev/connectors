import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { organizations, properties } from "@/lib/db/schema";
import { slugify } from "./domain";

/**
 * Handles for the admin detail URLs. Both columns are unique, so a
 * collision would fail the insert outright — these resolve one before the
 * row is written rather than letting the constraint decide.
 *
 * Only ever called on create. Renaming a record deliberately does not
 * re-slug it: an admin who has bookmarked a profile shouldn't lose the link
 * because someone fixed a typo in the name.
 */
async function unique(
  base: string,
  fallback: string,
  taken: (candidate: string) => Promise<boolean>,
) {
  const root = slugify(base) || fallback;
  if (!(await taken(root))) return root;
  for (let n = 2; n < 200; n++) {
    const candidate = `${root}-${n}`;
    if (!(await taken(candidate))) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

export function uniqueOrganizationSlug(name: string) {
  return unique(name, "organization", async (candidate) => {
    const rows = await getDb()
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, candidate))
      .limit(1);
    return rows.length > 0;
  });
}

/** City is part of the base, not a numeric suffix — property titles collide
 * constantly ("Ground Floor Retail Unit"), and "…-lahore" tells an admin
 * which one they're looking at where "…-4" doesn't. */
export function uniquePropertySlug(title: string, city?: string | null) {
  return unique([title, city].filter(Boolean).join(" "), "listing", async (candidate) => {
    const rows = await getDb()
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.slug, candidate))
      .limit(1);
    return rows.length > 0;
  });
}
