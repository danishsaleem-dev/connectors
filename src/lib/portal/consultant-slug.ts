import "server-only";
import { getDb } from "@/lib/db/client";
import { consultants } from "@/lib/db/schema";
import { slugify } from "./domain";

/** Name-derived handle for the public profile URL, with a numeric suffix if
 * two consultants share a name — the column is unique, so a collision would
 * otherwise fail the insert outright. Shared by the admin "add consultant"
 * form and self-service signup, so a slug looks the same either way. */
export async function uniqueConsultantSlug(name: string) {
  const base = slugify(name) || "consultant";
  const rows = await getDb().select({ slug: consultants.slug }).from(consultants);
  const taken = new Set(rows.map((r) => r.slug).filter(Boolean));
  if (!taken.has(base)) return base;
  for (let i = 2; i < 100; i++) {
    if (!taken.has(`${base}-${i}`)) return `${base}-${i}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}
