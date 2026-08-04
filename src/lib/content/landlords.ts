import type { Faq } from "@/lib/content/faq";
import type { TestimonialWithVideo } from "@/components/TestimonialSlider";

/** Content for /for-landlords's FAQ + testimonial sections — separate from
 * the generic homepage FAQ (src/lib/content/faq.ts), which answers "what is
 * Connectors" broadly rather than a landlord's actual questions. */

export const landlordFaqs: Faq[] = [
  {
    question: "How do you match our space to the right brand?",
    answer:
      "Format, footfall, catchment and the category of brand actively looking to expand into that kind of space — not a mass broadcast to every brand on our books.",
  },
  {
    question: "Is there a cost to list a property with you?",
    answer:
      "No — submitting a space costs nothing. We work from the same expansion deal on the brand side, not a listing fee on yours.",
  },
  {
    question: "What types of space do you place?",
    answer:
      "Retail units, mall floors, commercial towers, mixed-use developments and standalone buildings — anything a brand actively expanding would consider.",
  },
  {
    question: "How long does it typically take to fill a space?",
    answer:
      "It depends on format, location and the brands actively looking in that category at the time — we'll give you an honest read once we've seen the property, not a generic promise.",
  },
];

/**
 * PLACEHOLDER — every name and quote below is fictional, matching the
 * disclosure already established in src/lib/content/testimonials.ts. Replace
 * with real, permissioned quotes before this section goes live publicly.
 */
export const landlordTestimonials: TestimonialWithVideo[] = [
  {
    quote:
      "We had a vacant retail unit sitting empty for over a year. Within eight weeks of listing it with Connectors, two qualified brands were competing for the space. (placeholder)",
    role: "Asset Manager",
    company: "Meridian Retail Properties (placeholder)",
    videoUrl: null,
  },
  {
    quote:
      "They understood our footfall data better than the first agent we tried, and matched us with a brand that actually fit the catchment instead of whoever had a budget. (placeholder)",
    role: "Leasing Director",
    company: "Bloom & Co (placeholder)",
    videoUrl: null,
  },
  {
    quote:
      "No fee, no pressure to take the first offer. We waited three extra weeks for the right tenant and it was worth it. (placeholder)",
    role: "Property Owner",
    company: "Sovereign Property Holdings (placeholder)",
    videoUrl: null,
  },
];

/** Plays beside the FAQ block — an overview of how listing a property with
 * Connectors works. Null until there's real footage. */
export const landlordVideoUrl: string | null = null;
