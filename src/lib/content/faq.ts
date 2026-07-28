/**
 * Homepage FAQ. Every answer is grounded in the actual company profile and
 * real office data (src/lib/site.ts) — no invented pricing, no invented
 * minimums. Where the profile doesn't specify a number, the answer says so
 * generically rather than making one up.
 */
export type Faq = {
  question: string;
  answer: string;
};

export const faqs: Faq[] = [
  {
    question: "What does Connectors actually do?",
    answer:
      "We connect the people and places involved in retail and franchise expansion: brands with locations, franchisees and investors; landlords and mall owners with brands actively looking to expand. We're not consultants who hand over a report — we work both sides of the introduction until it becomes a signed deal.",
  },
  {
    question: "Which industries and regions do you work in?",
    answer:
      "We work across food & beverage, fashion & apparel, beauty & cosmetics, retail chains, fitness & wellness, entertainment, healthcare, education, technology, lifestyle, luxury retail and hospitality. We operate from offices in London, Las Vegas and Lahore, with a network that extends beyond all three.",
  },
  {
    question: "How does franchise-to-franchisee matching work?",
    answer:
      "We match on investment capacity, business experience, preferred territory, industry interest and operational capability — so a brand isn't just handed leads, and a franchisee isn't just shown whatever's available.",
  },
  {
    question: "What happens after a franchise agreement is signed?",
    answer:
      "Onboarding is structured, not improvised: a dedicated learning portal (the Applicant Learning Center), a full training LMS, a digital library of manuals and SOPs, and ongoing audit, compliance and support systems through the same platform — see The App.",
  },
  {
    question: "I'm a landlord with a vacant unit — how do I list it?",
    answer:
      "Submit the property through our landlords page with the type, size and location. We match it against brands actively seeking expansion locations in that category, rather than broadcasting it to everyone.",
  },
  {
    question: "Do you only work with large, established brands?",
    answer:
      "No — our franchise development services are built for brands turning a single successful location into a scalable franchise, as well as established multi-unit chains expanding into new markets. Tell us where you are and we'll tell you honestly whether we're a fit.",
  },
];
