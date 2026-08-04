import type { TestimonialWithVideo } from "@/components/TestimonialSlider";

/**
 * PLACEHOLDER CONTENT — every company name and quote below is fictional.
 *
 * None of these are real clients, and none of these quotes were said by
 * anyone. They exist to show the section's design before real testimonials
 * are available. Replace every entry with a real, permissioned quote (and
 * only ever attribute a quote to someone who actually said it) before this
 * site goes live — shipping fabricated endorsements is false advertising in
 * most jurisdictions, not just a style problem.
 *
 * Deliberately no photos/avatars are attached to these — pairing a real
 * human stock photo with a quote nobody said would misrepresent a real,
 * identifiable person as endorsing something they never did.
 */
export const homeTestimonials: TestimonialWithVideo[] = [
  {
    quote:
      "Connectors found us three locations in six months that we hadn't been able to identify on our own, and the franchisee vetting steered us away from at least two poor fits.",
    role: "Expansion Lead",
    company: "Northline Coffee (placeholder)",
    videoUrl: null,
  },
  {
    quote:
      "We had a vacant retail unit sitting empty for over a year. Within eight weeks of listing it with Connectors, two qualified brands were competing for the space.",
    role: "Asset Manager",
    company: "Meridian Retail Properties (placeholder)",
    videoUrl: null,
  },
  {
    quote:
      "The franchise management platform alone would have taken us a year to build in-house. It came bundled with the network relationship.",
    role: "Operations Director",
    company: "Solace Fitness (placeholder)",
    videoUrl: null,
  },
];

/** Plays beside the homepage FAQ block. Null until there's real footage. */
export const homeVideoUrl: string | null = null;
