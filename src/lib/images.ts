/**
 * Curated photography.
 *
 * Every ID below was downloaded and visually checked before being written in —
 * not guessed. Deliberately excluded: "team high-fives at a desk", casual
 * startup-office shots, and anything showing a third-party trademark (a Shell
 * forecourt on a consultancy site implies a client relationship that
 * doesn't exist).
 *
 * These are hotlinked from Unsplash, which is free for commercial use and
 * requires no attribution. Replace `id` values here with your own photography
 * when you have it — this file is the only place image sources are defined.
 */

const UNSPLASH = "https://images.unsplash.com";

/** Widths generated for the srcset. Covers phone through 2x desktop. */
export const PHOTO_WIDTHS = [640, 1024, 1600, 2400] as const;

export function photoUrl(id: string, width: number, quality = 72) {
  return `${UNSPLASH}/${id}?auto=format&fit=crop&w=${width}&q=${quality}`;
}

export function photoSrcSet(id: string, quality = 72) {
  return PHOTO_WIDTHS.map((w) => `${photoUrl(id, w, quality)} ${w}w`).join(", ");
}

export type Photo = {
  id: string;
  alt: string;
};

export const photos = {
  /** Bright multi-level shopping mall — the hero. */
  mall: {
    id: "photo-1519567241046-7f570eee3ce6",
    alt: "The bright multi-level atrium of a modern shopping mall, lined with retail units",
  },
  /** Menswear boutique interior — brand expansion. */
  boutique: {
    id: "photo-1441986300917-64674bd600d8",
    alt: "Interior of a contemporary clothing boutique with open shelving and folded stock",
  },
  /** Customer paying at a retail counter — franchise operations. */
  checkout: {
    id: "photo-1556742049-0cfed4f6a45d",
    alt: "A shop assistant taking a card payment from a customer at a retail counter",
  },
  /** Upscale restaurant dining room — food & beverage franchising. */
  restaurant: {
    id: "photo-1517248135467-4c7edcad34c4",
    alt: "The dining room of an upscale restaurant, set and empty before service",
  },
  /** Modern cafe interior — F&B and lifestyle. */
  cafe: {
    id: "photo-1567521464027-f127ff144326",
    alt: "A bright modern cafe interior with timber panelling and window seating",
  },
  /** Glass-partitioned office corridor — the company itself. */
  office: {
    id: "photo-1497366754035-f200968a6e72",
    alt: "A quiet modern office corridor lined with glass-partitioned meeting rooms",
  },
  /** Looking up at commercial towers — investors and capital. */
  towers: {
    id: "photo-1486406146926-c627a92ad1ab",
    alt: "Commercial office towers photographed looking upward against a pale sky",
  },
  /** Hand signing a document — agreements and structuring. */
  signing: {
    id: "photo-1450101499163-c8848c66ca85",
    alt: "A person signing a printed document with a fountain pen",
  },
  /** Boardroom presentation — investor presentations. */
  boardroom: {
    id: "photo-1542744173-8e7e53415bb0",
    alt: "A presenter addressing colleagues seated around a boardroom table",
  },
  /** Hands planning over notes — feasibility and strategy. */
  planning: {
    id: "photo-1454165804606-c3d57bc86b40",
    alt: "Two people working through handwritten plans and figures beside open laptops",
  },
  /** Analytics dashboard on screen — marketing performance. */
  analytics: {
    id: "photo-1560472354-b33ff0c44a43",
    alt: "A performance marketing dashboard showing traffic, impressions and click-through charts",
  },
  /** Data centre aisle — the technology platform. */
  datacentre: {
    id: "photo-1573164713988-8665fc963095",
    alt: "An engineer reviewing a tablet in the illuminated aisle of a data centre",
  },
  /** Gym floor — fitness franchising. */
  fitness: {
    id: "photo-1571019613454-1cb2f99b2d8b",
    alt: "A person training on the floor of a bright modern gym",
  },
} as const satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;
