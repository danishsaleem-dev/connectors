import "server-only";
import { resolveMediaUrls } from "@/lib/storage/media";

/** The subset of a `properties` row (raw or the listAllProperties join)
 * every mobile location endpoint needs — shared so the three routes that
 * each return "a list of locations" (browse, own-properties, favorites)
 * can't drift on what a location actually looks like. */
type PropertyLike = {
  id: string;
  title: string;
  propertyType: string;
  city: string;
  country: string | null;
  area: string | null;
  sizeSqft: number | null;
  dimensions: string | null;
  floorLevel: string | null;
  parkingAvailable: boolean;
  rentAmount: number | null;
  rentPeriod: string | null;
  currency: string;
  availableFrom: string | null;
  status: string;
  featured: boolean;
  description: string | null;
  photos: string[] | null;
};

/**
 * Shapes one property row into what the app's Location model reads.
 * Deliberately excludes organizationName/mapAddress/latitude/longitude and
 * anything else that would tell a brand who owns a listing, or exactly
 * where it is, before an admin facilitates that — see the browse route's
 * doc comment for why. `isFavorited` defaults false for contexts where
 * favoriting doesn't apply (an org viewing its own listings).
 */
export async function toMobileLocation(property: PropertyLike, isFavorited = false) {
  return {
    id: property.id,
    title: property.title,
    propertyType: property.propertyType,
    city: property.city,
    country: property.country,
    area: property.area,
    sizeSqft: property.sizeSqft,
    dimensions: property.dimensions,
    floorLevel: property.floorLevel,
    parkingAvailable: property.parkingAvailable,
    rentAmount: property.rentAmount,
    rentPeriod: property.rentPeriod,
    currency: property.currency,
    availableFrom: property.availableFrom,
    status: property.status,
    featured: property.featured,
    description: property.description,
    isFavorited,
    photoUrls: await resolveMediaUrls(property.photos ?? []),
  };
}
