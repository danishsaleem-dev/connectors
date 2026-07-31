import { MapPin } from "lucide-react";
import { resolveMediaUrl } from "@/lib/storage/media";
import { Pill, formatMoney } from "@/components/portal/ui";
import { PROPERTY_STATUS_LABEL, PROPERTY_TYPE_LABEL } from "@/lib/portal/domain";
import type { properties } from "@/lib/db/schema";

type PropertyRow = Pick<
  typeof properties.$inferSelect,
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
 * only ever renders inside Server Components. */
export async function PropertyCard({ property }: { property: PropertyRow }) {
  const coverUrl = await resolveMediaUrl(property.photos?.[0] ?? null);
  const rent = formatMoney(property.rentAmount, property.currency);

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
      </div>

      <div className="p-4">
        <p className="truncate font-medium">{property.title}</p>
        {property.organizationName && (
          <p className="mt-0.5 truncate text-xs text-[var(--muted)]">{property.organizationName}</p>
        )}
        <p className="mt-1.5 text-sm text-[var(--muted)]">
          {[
            [property.area, property.city, property.country].filter(Boolean).join(", "),
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
      </div>
    </div>
  );
}
