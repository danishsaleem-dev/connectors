"use client";

import { useEffect, useRef, useState } from "react";
import { Field, Input } from "@/components/ui";

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            opts?: Record<string, unknown>,
          ) => {
            addListener: (event: string, handler: () => void) => void;
            getPlace: () => {
              formatted_address?: string;
              address_components?: { long_name: string; types: string[] }[];
              geometry?: { location: { lat: () => number; lng: () => number } };
            };
          };
        };
      };
    };
    __connectorsMapsLoader?: Promise<void>;
  }
}

function loadGoogleMaps(): Promise<void> {
  if (window.google?.maps?.places) return Promise.resolve();
  if (!window.__connectorsMapsLoader) {
    window.__connectorsMapsLoader = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Google Maps"));
      document.head.appendChild(script);
    });
  }
  return window.__connectorsMapsLoader;
}

type Resolved = {
  city: string;
  country: string;
  mapAddress: string;
  lat: string;
  lng: string;
};

/**
 * Address autocomplete backed by Google Places, feeding the same
 * city/country/mapAddress/latitude/longitude fields the manual fallback
 * uses — the surrounding <form> submits identically either way, so
 * saveProperty needed no changes to support this.
 *
 * Renders the plain manual fields instead whenever
 * NEXT_PUBLIC_GOOGLE_MAPS_API_KEY isn't set, which is the default until a
 * real key is added — this is the only thing that decides which UI ships.
 */
export function AddressPicker({
  defaults,
}: {
  defaults?: { city?: string; country?: string; mapAddress?: string };
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [resolved, setResolved] = useState<Resolved | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!MAPS_KEY) return;
    let cancelled = false;

    loadGoogleMaps()
      .then(() => {
        if (cancelled || !inputRef.current) return;
        const autocomplete = new window.google!.maps.places.Autocomplete(inputRef.current, {
          types: ["address"],
          fields: ["formatted_address", "address_components", "geometry"],
        });
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.geometry) return;
          const components = place.address_components ?? [];
          const find = (type: string) =>
            components.find((c) => c.types.includes(type))?.long_name ?? "";
          setResolved({
            city:
              find("locality") ||
              find("postal_town") ||
              find("administrative_area_level_2"),
            country: find("country"),
            mapAddress: place.formatted_address ?? "",
            lat: String(place.geometry.location.lat()),
            lng: String(place.geometry.location.lng()),
          });
        });
      })
      .catch(() => setLoadError(true));

    return () => {
      cancelled = true;
    };
  }, []);

  if (!MAPS_KEY || loadError) {
    return (
      <>
        <Field label="City">
          <Input name="city" required defaultValue={defaults?.city} />
        </Field>
        <Field label="Country">
          <Input name="country" defaultValue={defaults?.country} />
        </Field>
        <Field
          label="Full address"
          hint="Shown as plain text for now"
          className="sm:col-span-2"
        >
          <Input name="mapAddress" defaultValue={defaults?.mapAddress} />
        </Field>
      </>
    );
  }

  return (
    <Field label="Address" hint="Start typing and pick a suggestion" className="sm:col-span-2">
      <Input
        ref={inputRef}
        name="mapAddressSearch"
        placeholder="Search for the address…"
        autoComplete="off"
        defaultValue={defaults?.mapAddress}
      />
      <input type="hidden" name="city" value={resolved?.city ?? defaults?.city ?? ""} />
      <input type="hidden" name="country" value={resolved?.country ?? defaults?.country ?? ""} />
      <input
        type="hidden"
        name="mapAddress"
        value={resolved?.mapAddress ?? defaults?.mapAddress ?? ""}
      />
      <input type="hidden" name="latitude" value={resolved?.lat ?? ""} />
      <input type="hidden" name="longitude" value={resolved?.lng ?? ""} />
      {resolved && (
        <p className="mt-1.5 text-xs text-[var(--muted)]">
          {resolved.city ? `${resolved.city}, ` : ""}
          {resolved.country}
        </p>
      )}
    </Field>
  );
}
