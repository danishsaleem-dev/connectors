import type { Faq } from "@/lib/content/faq";
import type { TestimonialWithVideo } from "@/components/TestimonialSlider";

/** Content for /for-franchise's FAQ + testimonial sections — separate from
 * the generic homepage FAQ (src/lib/content/faq.ts), which answers "what is
 * Connectors" broadly rather than a franchisee's actual questions. */

export const franchiseFaqs: Faq[] = [
  {
    question: "How is a franchise matched to me, rather than just listed?",
    answer:
      "We match on investment capacity, experience, preferred territory and industry interest — not just whoever applies first. You won't be shown a brand whose numbers or footprint don't fit what you've told us.",
  },
  {
    question: "What happens after I apply?",
    answer:
      "We review your application against the brands actively looking for franchisees in your territory, then set up a call. If nothing fits yet, we say so rather than pushing a mismatch.",
  },
  {
    question: "What support do I get once I've signed?",
    answer:
      "Onboarding, training and a marketing campaign built for your opening, then ongoing systems for compliance, support and reporting through the Connectors app — see The App for the full platform.",
  },
  {
    question: "Do you only work with large, established brands?",
    answer:
      "No — brands turning a single successful location into a scalable franchise are as much a fit here as established multi-unit chains. The brand listing below is exactly who's actively franchising right now.",
  },
];

/**
 * PLACEHOLDER — every name and quote below is fictional, matching the
 * disclosure already established in src/lib/content/testimonials.ts. Replace
 * with real, permissioned quotes before this section goes live publicly.
 */
export const franchiseTestimonials: TestimonialWithVideo[] = [
  {
    quote:
      "They turned down two territories I was set on before matching me with the one that's now outperforming every projection they gave me. (placeholder)",
    role: "Franchisee",
    company: "Northline Coffee, Manchester (placeholder)",
    videoUrl: null,
  },
  {
    quote:
      "The training and onboarding were structured enough that I opened on schedule with no surprises — everything I needed was in the app before day one. (placeholder)",
    role: "Franchisee",
    company: "Verona Kitchens, Leeds (placeholder)",
    videoUrl: null,
  },
  {
    quote:
      "I'd applied to two other franchise networks before this one. This was the only one that told me honestly when a territory wasn't a fit. (placeholder)",
    role: "Franchisee",
    company: "Solace Fitness, Bristol (placeholder)",
    videoUrl: null,
  },
];

/** Plays beside the FAQ block — an overview of what franchising through
 * Connectors looks like. Null until there's real footage. */
export const franchiseVideoUrl: string | null = null;
