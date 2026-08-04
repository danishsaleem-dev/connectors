"use client";

import { useState } from "react";
import { Maximize2, MapPin, Ruler } from "lucide-react";
import { ActionForm } from "@/components/portal/ActionForm";
import { Modal } from "@/components/Modal";
import { Pill } from "@/components/portal/ui";
import { ButtonLink } from "@/components/ui";
import { createRequest } from "@/lib/portal/actions";
import { PROPERTY_STATUS_LABEL, PROPERTY_TYPE_LABEL } from "@/lib/portal/domain";

export type LocationCardData = {
  id: string;
  title: string;
  city: string;
  country: string | null;
  area: string | null;
  status: string;
  propertyType: string;
  sizeSqft: number | null;
  dimensions: string | null;
  parkingAvailable: boolean;
  description: string | null;
  photoUrls: string[];
};

/** Width of one card in the listing grids. The subtractions are the gap-5
 * those grids use (1.25rem × the number of gutters in the row), so 2 / 3 / 4
 * cards land exactly on the row with no rounding drift. */
export const LOCATION_CARD_WIDTH =
  "w-full sm:w-[calc((100%-1.25rem)/2)] md:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-3.75rem)/4)]";

/** Basic teaser is public; the full profile and the enquiry form only ever
 * render for a viewer already confirmed server-side to be a brand — an
 * anonymous or non-brand visitor gets a locked message instead, never the
 * gated content itself. */
export function LocationCard({
  location,
  viewerIsBrand,
}: {
  location: LocationCardData;
  viewerIsBrand: boolean;
}) {
  const [open, setOpen] = useState(false);
  const cover = location.photoUrls[0] ?? null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-left transition-all hover:border-violet-400 hover:shadow-[0_28px_56px_-32px_rgba(20,20,26,0.35)]"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-sunken)]">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element -- private signed Storage URL
            <img
              src={cover}
              alt=""
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--muted)]">
              <MapPin size={28} />
            </div>
          )}
          <div className="absolute left-2.5 top-2.5">
            <Pill tone="green">{PROPERTY_STATUS_LABEL[location.status] ?? location.status}</Pill>
          </div>
          <div className="absolute right-2.5 top-2.5">
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-medium text-ink backdrop-blur-sm">
              {PROPERTY_TYPE_LABEL[location.propertyType] ?? location.propertyType}
            </span>
          </div>
        </div>

        {/* Sized for a four-across grid: the title is clamped to two lines
            and the meta row pinned to the bottom with mt-auto, so cards in a
            row stay the same height whatever their copy length. */}
        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-display line-clamp-2 text-base leading-snug text-balance">
            {location.title}
          </h3>
          <p className="mt-1.5 flex items-start gap-1.5 text-[13px] leading-snug text-[var(--muted)]">
            <MapPin size={13} className="mt-0.5 shrink-0 text-violet-600" />
            <span className="line-clamp-2">
              {[location.area, location.city, location.country]
                .filter(Boolean)
                .join(", ")}
            </span>
          </p>

          {(location.sizeSqft != null || location.dimensions) && (
            <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1.5 border-t border-[var(--border)] pt-3.5 text-xs text-[var(--muted)]">
              {location.sizeSqft != null && (
                <span className="inline-flex items-center gap-1.5">
                  <Maximize2 size={13} className="text-violet-600" />
                  {location.sizeSqft.toLocaleString()} sq ft
                </span>
              )}
              {location.dimensions && (
                <span className="inline-flex items-center gap-1.5">
                  <Ruler size={13} className="text-violet-600" />
                  {location.dimensions}
                </span>
              )}
            </div>
          )}
        </div>
      </button>

      {open &&
        (viewerIsBrand ? (
          <Modal
            onClose={() => setOpen(false)}
            className="max-h-[85vh] max-w-3xl overflow-y-auto lg:grid lg:grid-cols-2"
          >
            <div className="grid gap-1 bg-[var(--surface-sunken)] p-1 lg:grid-rows-2">
              {(location.photoUrls.length > 0 ? location.photoUrls : [null]).slice(0, 4).map((url, i) => (
                <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-lg">
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- private signed Storage URL
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[var(--muted)]">
                      <MapPin size={28} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-6 sm:p-8">
              <h2 className="font-display text-xl">{location.title}</h2>
              <p className="mt-1 text-sm text-violet-600">
                {PROPERTY_TYPE_LABEL[location.propertyType] ?? location.propertyType}
              </p>
              <p className="mt-3 text-sm text-[var(--muted)]">
                {[location.area, location.city, location.country].filter(Boolean).join(", ")}
              </p>

              <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-5 text-sm">
                {location.sizeSqft != null && (
                  <div>
                    <dt className="text-xs text-[var(--muted)]">Size</dt>
                    <dd className="mt-0.5">{location.sizeSqft.toLocaleString()} sq ft</dd>
                  </div>
                )}
                {location.dimensions && (
                  <div>
                    <dt className="text-xs text-[var(--muted)]">Dimensions</dt>
                    <dd className="mt-0.5">{location.dimensions}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-[var(--muted)]">Parking</dt>
                  <dd className="mt-0.5">{location.parkingAvailable ? "Available" : "Not available"}</dd>
                </div>
              </dl>

              {location.description && (
                <p className="mt-5 text-sm leading-relaxed text-[var(--muted)] text-pretty">
                  {location.description}
                </p>
              )}

              <div className="mt-6 border-t border-[var(--border)] pt-6">
                <ActionForm
                  action={createRequest}
                  submitLabel="Enquire about this location"
                  pendingLabel="Sending…"
                  successMessage="Sent — our team will follow up directly."
                  hiddenFields={{
                    type: "space",
                    title: `Enquiry: ${location.title}`,
                    notes: `Interested in "${location.title}" — ${[location.area, location.city, location.country].filter(Boolean).join(", ")}. Property ID: ${location.id}`,
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </Modal>
        ) : (
          <Modal onClose={() => setOpen(false)} className="max-w-md p-8 text-center">
            <p className="font-display text-xl">Brands only, for now.</p>
            <p className="mt-3 leading-relaxed text-[var(--muted)] text-pretty">
              Full location details and enquiries are reserved for brand
              accounts. Sign in as a brand, or create one, to see this listing
              in full.
            </p>
            <div className="mt-6 flex justify-center">
              <ButtonLink href="?auth=register">Create a brand account</ButtonLink>
            </div>
          </Modal>
        ))}
    </>
  );
}
