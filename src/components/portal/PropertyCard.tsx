import { MapPin, Star } from "lucide-react";
import { resolveMediaUrl } from "@/lib/storage/media";
import { ActionForm } from "@/components/portal/ActionForm";
import { Pill, formatMoney } from "@/components/portal/ui";
import { createRequest, toggleFavorite } from "@/lib/portal/actions";
import { PROPERTY_STATUS_LABEL, PROPERTY_TYPE_LABEL } from "@/lib/portal/domain";
import type { properties } from "@/lib/db/schema";

type PropertyRow = Pick<
  typeof properties.$inferSelect,
  | "id"
  | "title"
  | "status"
  | "photos"
  | "area"
  | "city"
  | "country"
  | "propertyType"
  | "sizeSqft"
  | "rentAmount"
  | "rentPeriod"
  | "currency"
  | "description"
> & { organizationName?: string };

/** Image-on-top card for browsing listings — async because resolving the
 * cover photo to a signed URL is itself an awaited call, fine here since this
 * only ever renders inside Server Components.
 *
 * The star is a plain `<form action={toggleFavorite}>`, not an ActionForm —
 * it's a single boolean flip with no field to validate and no message worth
 * showing, so it works via ordinary server-action progressive enhancement
 * without needing client JS or a pending-state wrapper.
 */
export async function PropertyCard({
  property,
  isFavorited = false,
}: {
  property: PropertyRow;
  isFavorited?: boolean;
}) {
  const coverUrl = await resolveMediaUrl(property.photos?.[0] ?? null);
  const rent = formatMoney(property.rentAmount, property.currency);
  const location = [property.area, property.city, property.country].filter(Boolean).join(", ");

  // A plain <form action={...}> binds to a single-argument server action,
  // not the (prevState, formData) shape every other action here uses for
  // useActionState — this thin inline wrapper adapts toggleFavorite without
  // changing its exported signature, which other callers may still want.
  async function toggleFavoriteAction(formData: FormData) {
    "use server";
    await toggleFavorite({ ok: false }, formData);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition-shadow hover:shadow-[0_24px_48px_-28px_rgba(20,20,26,0.3)]">
      <div className="relative aspect-[4/3] bg-[var(--surface-sunken)]">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- a private, signed Storage URL.
          <img src={coverUrl} alt={property.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--muted)]">
            <MapPin size={28} />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <Pill tone={property.status === "available" ? "green" : "neutral"}>
            {PROPERTY_STATUS_LABEL[property.status] ?? property.status}
          </Pill>
        </div>
        <form action={toggleFavoriteAction} className="absolute right-3 top-3">
          <input type="hidden" name="propertyId" value={property.id} />
          <button
            type="submit"
            aria-label={isFavorited ? "Remove from favorites" : "Save to favorites"}
            aria-pressed={isFavorited}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[var(--muted)] shadow-sm backdrop-blur-sm transition-colors hover:text-amber-500"
          >
            <Star size={15} className={isFavorited ? "fill-amber-400 text-amber-400" : undefined} />
          </button>
        </form>
      </div>

      <div className="p-4">
        <p className="truncate font-medium">{property.title}</p>
        {property.organizationName && (
          <p className="mt-0.5 truncate text-xs text-[var(--muted)]">{property.organizationName}</p>
        )}
        <p className="mt-1.5 text-sm text-[var(--muted)]">
          {[
            location,
            PROPERTY_TYPE_LABEL[property.propertyType],
            property.sizeSqft ? `${property.sizeSqft.toLocaleString()} sq ft` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {/* {rent && (
          <p className="mt-1.5 text-sm font-medium">
            {rent}
            <span className="font-normal text-[var(--muted)]">/{property.rentPeriod ?? "mo"}</span>
          </p>
        )} */}
        {property.description && (
          <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">{property.description}</p>
        )}

        <div className="mt-3 border-t border-[var(--border)] pt-3">
          <ActionForm
            action={createRequest}
            submitLabel="Enquire"
            pendingLabel="Sending…"
            successMessage="Sent — our team will follow up directly."
            hiddenFields={{
              type: "space",
              title: `Enquiry: ${property.title}`,
              notes: `Interested in "${property.title}"${location ? ` — ${location}` : ""}. Property ID: ${property.id}`,
            }}
            size="sm"
            layout="inline"
          />
        </div>
      </div>
    </div>
  );
}
