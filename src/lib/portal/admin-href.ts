import { orgTypeMeta } from "./domain";
import type { OrgType } from "@/lib/db/schema";

/**
 * Admin detail URLs, in one place so every link agrees on which handle to
 * use.
 *
 * Each prefers the readable slug and falls back to the uuid, because the
 * slug columns are nullable — a row created before slugs existed, or one
 * whose generation failed, still has to be reachable. The detail routes
 * resolve either form.
 */
export function orgHref(org: { id: string; slug?: string | null; type: OrgType }) {
  return `/portal/admin/${orgTypeMeta(org.type).slug}/${org.slug || org.id}`;
}

export function propertyHref(property: { id: string; slug?: string | null }) {
  return `/portal/admin/locations/${property.slug || property.id}`;
}

export function consultantHref(consultant: { id: string; slug?: string | null }) {
  return `/portal/admin/consultants/${consultant.slug || consultant.id}`;
}

/**
 * True when a URL segment is uuid-shaped.
 *
 * The id columns are uuid, and Postgres casts *every* branch of an OR before
 * evaluating any of them — so including an id comparison for a slug handle
 * fails the whole query with `invalid input syntax for type uuid` rather
 * than falling through to the slug match. Detail routes use this to decide
 * whether the uuid branches are safe to include at all.
 */
export function isUuid(handle: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(handle);
}
