/**
 * The admin edit URL for a consultant.
 *
 * Prefers the slug — it's readable, and it's the same handle the public
 * profile uses, so an admin recognises the row from the URL. Falls back to
 * the id because `consultants.slug` is nullable: rows created before slugs
 * existed, or any row whose slug generation failed, still need to be
 * reachable. The detail route resolves either form.
 */
export function consultantHref(consultant: { id: string; slug?: string | null }) {
  return `/portal/admin/consultants/${consultant.slug || consultant.id}`;
}
