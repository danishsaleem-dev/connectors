import type { Faq } from "@/lib/content/faq";
import type { TestimonialWithVideo } from "@/components/TestimonialSlider";

/** Content for /for-brands's FAQ + testimonial sections — separate from the
 * generic homepage FAQ (src/lib/content/faq.ts), which answers "what is
 * Connectors" broadly rather than a brand's actual questions. */

export const brandFaqs: Faq[] = [
  {
    question: "Do we have to franchise to work with you?",
    answer:
      "No. Location sourcing, investor connections and marketing all stand on their own. Franchise development is one division among five — relevant once you're ready to turn a proven location into a network, not a precondition for anything else.",
  },
  {
    question: "How does location matching actually work?",
    answer:
      "We work from the brief you give us — target cities, format, footprint and budget — against real availability, not a generic list. You'll see the reasoning behind a site, not just an address.",
  },
  {
    question: "What if we're a single-location business, not a chain?",
    answer:
      "That's exactly who franchise development is built for — turning one working location into a model somebody else can run. Multi-unit brands expanding into new markets are just as much a fit.",
  },
  {
    question: "What happens after we submit the expansion request?",
    answer:
      "A real conversation with the relevant division, not an automated reply. We tell you honestly what's realistic in your target markets before any location or franchisee introduction is made.",
  },
];

/**
 * PLACEHOLDER — every name and quote below is fictional, matching the
 * disclosure already established in src/lib/content/testimonials.ts. Replace
 * with real, permissioned quotes before this section goes live publicly.
 */
export const brandTestimonials: TestimonialWithVideo[] = [
  {
    quote:
      "We'd been trying to place our third location ourselves for eight months. Connectors found two viable sites in six weeks, with the footfall data already done. (placeholder)",
    role: "Expansion Director",
    company: "Northline Coffee (placeholder)",
    videoUrl: null,
  },
  {
    quote:
      "Turning our first store into a franchise model felt too big to figure out alone. Having the structuring, the territory model and the franchisee vetting handled meant we could stay focused on the business itself. (placeholder)",
    role: "Founder",
    company: "Verona Kitchens (placeholder)",
    videoUrl: null,
  },
  {
    quote:
      "The investor introduction came with real diligence already done — not just a name and a phone number. That saved us weeks. (placeholder)",
    role: "CEO",
    company: "Solace Fitness (placeholder)",
    videoUrl: null,
  },
];

/** Plays beside the FAQ block — an overview of what expanding with
 * Connectors looks like. Null until there's real footage. */
export const brandVideoUrl: string | null = null;
