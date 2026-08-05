"use client";

import { useActionState, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, Maximize2, MapPin, Ruler, X } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Button, ButtonLink } from "@/components/ui";
import { Pill } from "@/components/portal/ui";
import { createRequest, toggleFavorite, type ActionState } from "@/lib/portal/actions";
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
  isFavorited = false,
}: {
  location: LocationCardData;
  viewerIsBrand: boolean;
  isFavorited?: boolean;
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
          <LocationDetailModal
            location={location}
            isFavorited={isFavorited}
            onClose={() => setOpen(false)}
          />
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

function LocationDetailModal({
  location,
  isFavorited,
  onClose,
}: {
  location: LocationCardData;
  isFavorited: boolean;
  onClose: () => void;
}) {
  const photos = location.photoUrls.length > 0 ? location.photoUrls : [null];
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <Modal
      onClose={onClose}
      className="max-h-[85vh] max-w-5xl overflow-y-auto lg:grid lg:grid-cols-2 lg:overflow-hidden"
    >
      <div className="bg-[var(--surface-sunken)] p-4 sm:p-5 lg:max-h-[85vh] lg:overflow-y-auto">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[var(--surface)]">
          {photos[activeIndex] ? (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="group block h-full w-full"
              aria-label="Preview this photo full size"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- private signed Storage URL */}
              <img
                src={photos[activeIndex] ?? undefined}
                alt=""
                className="h-full w-full object-cover"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors group-hover:bg-ink/20">
                <span className="flex items-center gap-1.5 rounded-full bg-white/0 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:bg-ink/70 group-hover:opacity-100">
                  <Maximize2 size={13} /> Preview
                </span>
              </span>
            </button>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--muted)]">
              <MapPin size={28} />
            </div>
          )}

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setActiveIndex((i) => (i - 1 + photos.length) % photos.length)}
                aria-label="Previous photo"
                className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition-colors hover:bg-white"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => setActiveIndex((i) => (i + 1) % photos.length)}
                aria-label="Next photo"
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition-colors hover:bg-white"
              >
                <ChevronRight size={16} />
              </button>
              <span className="absolute bottom-2 right-2 rounded-full bg-ink/70 px-2 py-0.5 text-[11px] font-medium text-white">
                {activeIndex + 1} / {photos.length}
              </span>
            </>
          )}
        </div>

        {photos.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {photos.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg ring-2 transition-colors ${
                  i === activeIndex ? "ring-violet-600" : "ring-transparent hover:ring-violet-300"
                }`}
              >
                {url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- private signed Storage URL
                  <img src={url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[var(--surface)] text-[var(--muted)]">
                    <MapPin size={14} />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 sm:p-8 lg:max-h-[85vh] lg:overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl">{location.title}</h2>
            <p className="mt-1 text-sm text-violet-600">
              {PROPERTY_TYPE_LABEL[location.propertyType] ?? location.propertyType}
            </p>
          </div>
          <SaveButton propertyId={location.id} isFavorited={isFavorited} />
        </div>

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
          <EnquireBlock location={location} />
        </div>
      </div>

      {lightboxOpen && photos[activeIndex] && (
        <Lightbox
          photos={photos}
          activeIndex={activeIndex}
          onIndexChange={setActiveIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </Modal>
  );
}

function EnquireBlock({ location }: { location: LocationCardData }) {
  const initialState: ActionState = { ok: false };
  const [state, formAction, pending] = useActionState(createRequest, initialState);

  if (state.ok) {
    return (
      <p className="rounded-xl bg-violet-50 px-4 py-3.5 text-center text-sm font-medium text-violet-700">
        One of our representatives will connect with you in a few minutes!
      </p>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="type" value="space" />
      <input type="hidden" name="title" value={`Enquiry: ${location.title}`} />
      <input
        type="hidden"
        name="notes"
        value={`Interested in "${location.title}" — ${[location.area, location.city, location.country].filter(Boolean).join(", ")}. Property ID: ${location.id}`}
      />
      <Button type="submit" disabled={pending} showIcon={!pending} className="w-full">
        {pending ? "Sending…" : "Enquire about this location"}
      </Button>
      {state.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
    </form>
  );
}

/** Heart toggle so a signed-in brand can bookmark a listing straight from the
 * public site — it lands in the same favorites the star on /portal/locations
 * reads, so there's exactly one favorites list either entry point writes to. */
function SaveButton({ propertyId, isFavorited }: { propertyId: string; isFavorited: boolean }) {
  const initialState: ActionState = { ok: false };
  const [favorited, setFavorited] = useState(isFavorited);
  const [, dispatch] = useActionState(toggleFavorite, initialState);

  return (
    <form
      action={(formData: FormData) => {
        setFavorited((f) => !f);
        dispatch(formData);
      }}
      className="shrink-0"
    >
      <input type="hidden" name="propertyId" value={propertyId} />
      <button
        type="submit"
        aria-pressed={favorited}
        aria-label={favorited ? "Remove from saved properties" : "Save this property"}
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
          favorited
            ? "border-rose-200 bg-rose-50 text-rose-600"
            : "border-[var(--border)] text-[var(--muted)] hover:border-rose-300 hover:text-rose-600"
        }`}
      >
        <Heart size={13} className={favorited ? "fill-rose-500 text-rose-500" : undefined} />
        {favorited ? "Saved" : "Save"}
      </button>
    </form>
  );
}

function Lightbox({
  photos,
  activeIndex,
  onIndexChange,
  onClose,
}: {
  photos: (string | null)[];
  activeIndex: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Capture phase + stopPropagation so this fires before (and pre-empts)
        // the parent Modal's own Escape listener — otherwise both close at
        // once, since they're both bound to window.
        e.stopPropagation();
        onClose();
      }
      if (e.key === "ArrowLeft") onIndexChange((activeIndex - 1 + photos.length) % photos.length);
      if (e.key === "ArrowRight") onIndexChange((activeIndex + 1) % photos.length);
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, [activeIndex, photos.length, onClose, onIndexChange]);

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-ink/90 p-6"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close preview"
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <X size={18} />
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element -- private signed Storage URL */}
      <img
        src={photos[activeIndex] ?? undefined}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain"
      />

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onIndexChange((activeIndex - 1 + photos.length) % photos.length);
            }}
            aria-label="Previous photo"
            className="absolute left-5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onIndexChange((activeIndex + 1) % photos.length);
            }}
            aria-label="Next photo"
            className="absolute right-5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <ChevronRight size={20} />
          </button>
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
            {activeIndex + 1} / {photos.length}
          </span>
        </>
      )}
    </div>
  );
}
