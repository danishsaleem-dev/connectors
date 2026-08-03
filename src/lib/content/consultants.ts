import type { Faq } from "@/lib/content/faq";
import type { TestimonialWithVideo } from "@/components/TestimonialSlider";

/**
 * Content for the public /consultants page — Connectors' own in-house
 * consultancy service, offered to brands, franchisees and landlords.
 * Distinct from the Partners Program (src/lib/content/partners.ts), which
 * onboards external vendors — don't merge the two on this page.
 */

export type ConsultingAudience = {
  audience: string;
  body: string;
};

export const consultingAudiences: ConsultingAudience[] = [
  {
    audience: "Brands",
    body: "Market entry, site selection and franchise structuring for a brand planning its next opening or its first franchise.",
  },
  {
    audience: "Franchisees",
    body: "Feasibility and operational planning before you commit capital to a territory or a unit.",
  },
  {
    audience: "Landlords",
    body: "Positioning a space, and reading which brands and formats it will actually attract.",
  },
];

export const consultantFaqs: Faq[] = [
  {
    question: "Are your consultants Connectors staff, or outside contractors?",
    answer:
      "They work directly with the Connectors team on your engagement — this isn't a marketplace referral. The consultant you're introduced to stays involved from the first conversation through delivery.",
  },
  {
    question: "Do I need to already be a Connectors client to hire one?",
    answer:
      "No. Consultancy is a standalone service — useful on its own, and just as useful alongside our brand expansion, franchise development or landlord services if you decide to go further.",
  },
  {
    question: "How is a project scoped and priced?",
    answer:
      "It depends on what you need — a single feasibility study is a different engagement to ongoing franchise structuring support. Tell us the problem on a call and we'll scope it honestly, including if we think you don't need us yet.",
  },
  {
    question: "Can a consultant work alongside our existing team?",
    answer:
      "Yes — most engagements do. They're brought in for a specific gap: market data, franchise mechanics, site evaluation, rather than replacing decisions your team is already equipped to make.",
  },
];

/**
 * PLACEHOLDER — every name and quote below is fictional, matching the
 * disclosure already established in src/lib/content/testimonials.ts. Replace
 * with real, permissioned quotes before this section goes live publicly.
 */
export type ConsultantTestimonial = TestimonialWithVideo;

export const consultantTestimonials: ConsultantTestimonial[] = [
  {
    quote:
      "The feasibility study talked us out of a location we were fairly set on — and into one that's now our best-performing site. (placeholder)",
    role: "Founder",
    company: "Northline Coffee (placeholder)",
    videoUrl: null,
  },
  {
    quote:
      "We'd never franchised before. Having someone structure the agreement and the territory model before we sold the first unit saved us from mistakes we'd have made blind. (placeholder)",
    role: "Managing Director",
    company: "Verona Kitchens (placeholder)",
    videoUrl: null,
  },
  {
    quote:
      "Straightforward, specific advice — no generic playbook. They knew our category. (placeholder)",
    role: "Asset Manager",
    company: "Meridian Retail Properties (placeholder)",
    videoUrl: null,
  },
];

/** Plays beside the FAQ block — an overview of how the consultancy works.
 * Same rule as the testimonial videos: null until there's real footage. */
export const consultancyVideoUrl: string | null = null;
