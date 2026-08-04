import type { Faq } from "@/lib/content/faq";
import type { TestimonialWithVideo } from "@/components/TestimonialSlider";

/** Content for /for-investors's FAQ + testimonial sections — separate from
 * the generic homepage FAQ (src/lib/content/faq.ts), which answers "what is
 * Connectors" broadly rather than an investor's actual questions. */

export const investorFaqs: Faq[] = [
  {
    question: "What does diligence actually cover before an introduction?",
    answer:
      "Performance data, unit economics, franchise structuring and agreements — the same package we'd want to see ourselves. You're never introduced to a name with nothing behind it.",
  },
  {
    question: "What ticket sizes and sectors do you work with?",
    answer:
      "Share your range and sector interest on the form below and we'll bring opportunities that actually match it — we don't run a one-size pipeline across every investor.",
  },
  {
    question: "How is this different from being cold-pitched by a brand?",
    answer:
      "Every opportunity has been vetted against real numbers before it reaches you. If a brand's economics don't hold up, you won't hear about it from us.",
  },
  {
    question: "What happens after I share my investment profile?",
    answer:
      "A conversation with our investor connections team, not an automated match. We'd rather tell you honestly that nothing fits yet than introduce a mismatch.",
  },
];

/**
 * PLACEHOLDER — every name and quote below is fictional, matching the
 * disclosure already established in src/lib/content/testimonials.ts. Replace
 * with real, permissioned quotes before this section goes live publicly.
 */
export const investorTestimonials: TestimonialWithVideo[] = [
  {
    quote:
      "Every opportunity came with the unit economics already stress-tested. I spent my diligence time confirming their numbers, not building them from scratch. (placeholder)",
    role: "Managing Partner",
    company: "Marchetti & Co (placeholder)",
    videoUrl: null,
  },
  {
    quote:
      "They turned down putting me in front of two brands whose numbers didn't hold up under their own review. That's the opposite of how most introductions work. (placeholder)",
    role: "Private Investor",
    company: "Vantage Living (placeholder)",
    videoUrl: null,
  },
  {
    quote:
      "The franchise structuring was already agreed before I was introduced — I was evaluating a real opportunity, not negotiating one from scratch. (placeholder)",
    role: "Investment Director",
    company: "Atlas Electronics (placeholder)",
    videoUrl: null,
  },
];

/** Plays beside the FAQ block — an overview of how investor introductions
 * work through Connectors. Null until there's real footage. */
export const investorVideoUrl: string | null = null;
