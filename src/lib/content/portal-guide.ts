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
