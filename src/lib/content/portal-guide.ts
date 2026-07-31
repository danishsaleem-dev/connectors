import type { OrgType } from "@/lib/db/schema";

/**
 * Static reference content shown on each participant's dashboard — what
 * Connectors does for this type of participant, and who we do it for.
 *
 * Deliberately plain data, not a feature: nothing here links to another
 * module, queries anything, or changes based on the org's own record. It's
 * the same brochure copy the marketing site carries, surfaced inside the
 * portal so a signed-in participant sees what their account is actually for.
 */

export type PortalGuide = {
  headline: string;
  intro: string;
  services: { title: string; items: string[] };
  audience: { title: string; items: string[] };
};

export const PORTAL_GUIDE: Partial<Record<OrgType, PortalGuide>> = {
  franchisee: {
    headline: "Franchise development & sales",
    intro:
      "Connectors helps brands transform into scalable franchise businesses — we design, structure, market and sell franchise opportunities to qualified franchise investors and operators. Submit a request with your budget, territory and experience, and our team will match you against opportunities that actually fit.",
    services: {
      title: "Our franchise services",
      items: [
        "Franchise model development",
        "Franchise business structuring",
        "Franchise documentation",
        "Franchise operations systems",
        "Franchise sales",
        "Franchise lead generation",
        "Franchise matchmaking",
        "Franchise territory management",
        "Franchise marketing campaigns",
        "Franchise investor presentations",
        "Franchise onboarding",
      ],
    },
    audience: {
      title: "Sectors we franchise in",
      items: [
        "Restaurants",
        "Cafes",
        "Fashion brands",
        "Beauty brands",
        "Electronics retailers",
        "Fitness brands",
        "Convenience stores",
        "Luxury brands",
        "Lifestyle retailers",
        "International franchises",
      ],
    },
  },
  brand: {
    headline: "Brand expansion & location services",
    intro:
      "We help brands identify, secure and expand into high-potential commercial locations. Our team runs detailed market research, location analysis, demographic studies, traffic assessments and retail feasibility evaluations, so you open where the numbers actually work.",
    services: {
      title: "What we do for you",
      items: [
        "Retail location sourcing",
        "Commercial leasing support",
        "Site evaluation & feasibility analysis",
        "Mall placement strategies",
        "High-footfall retail positioning",
        "Expansion planning",
        "Multi-city rollout planning",
        "Territory development",
        "Real estate negotiations",
        "Retail market intelligence",
      ],
    },
    audience: {
      title: "Brands we work with",
      items: [
        "Restaurants",
        "Cafes",
        "Fashion brands",
        "Beauty brands",
        "Electronics retailers",
        "Fitness brands",
        "Convenience stores",
        "Luxury brands",
        "Lifestyle retailers",
        "International franchises",
      ],
    },
  },
};
