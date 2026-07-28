import type { AudienceSlug } from "@/lib/site";

export type DivisionPanel = {
  title: string;
  items: string[];
};

export type Division = {
  slug: string;
  /** Zero-padded ordinal shown as a display numeral on cards. */
  index: string;
  title: string;
  /** Short label for the nav mega-menu. */
  navLabel: string;
  /** One line. Used on cards and in the nav. */
  short: string;
  /** Opening paragraph on the division's own page. */
  lead: string;
  /** The core service list — the spine of each division page. */
  services: string[];
  /** Supporting lists: who we work with, benefits, channels, property types. */
  panels?: DivisionPanel[];
  /** Audience pages that should surface this division. */
  audiences: AudienceSlug[];
};

/**
 * The seven business divisions, transcribed from the Connectors corporate
 * profile. Kept as data so the division pages, the homepage grid and the nav
 * mega-menu all render from one source and can never drift apart.
 */
export const divisions: Division[] = [
  {
    slug: "brand-expansion",
    index: "01",
    title: "Brand Expansion & Location Services",
    navLabel: "Brand Expansion",
    short: "Find, evaluate and secure high-potential retail locations.",
    lead: "We help brands identify, secure and expand into high-potential commercial locations. Our team runs market research, location analysis, demographic studies, traffic assessments and retail feasibility evaluations so that every store opens somewhere that can carry it.",
    services: [
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
    panels: [
      {
        title: "We work with",
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
    ],
    audiences: ["for-brands", "for-landlords"],
  },
  {
    slug: "franchise-development",
    index: "02",
    title: "Franchise Development & Sales",
    navLabel: "Franchise Development",
    short: "Turn a proven business into a scalable franchise — and sell it well.",
    lead: "We help brands become franchise businesses: designing the model, structuring the documentation and operations, then marketing and selling the opportunity to qualified franchise investors and operators.",
    services: [
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
    panels: [
      {
        title: "How we match franchisees",
        items: [
          "Investment capacity",
          "Business experience",
          "Preferred territory",
          "Industry interest",
          "Operational capabilities",
        ],
      },
    ],
    audiences: ["for-brands", "for-franchise"],
  },
  {
    slug: "investor-connections",
    index: "03",
    title: "Investor Connection Services",
    navLabel: "Investor Connections",
    short: "Introduce brands to capital, and investors to verified opportunities.",
    lead: "We help brands secure strategic investors for expansion and growth — and help investors discover verified, scalable business opportunities on the other side of the same table.",
    services: [
      "Brand investment opportunities",
      "Investor matchmaking",
      "Growth capital partnerships",
      "Retail expansion funding",
      "Joint venture opportunities",
      "Business acquisition support",
      "Multi-unit franchise investment opportunities",
      "Startup retail funding support",
    ],
    panels: [
      {
        title: "What investors get access to",
        items: [
          "Proven business models",
          "Retail franchise opportunities",
          "Expansion-ready brands",
          "High-potential commercial projects",
          "Investment advisory support",
        ],
      },
    ],
    audiences: ["for-brands", "for-investors"],
  },
  {
    slug: "mall-projects",
    index: "04",
    title: "Mall & Project Development Support",
    navLabel: "Mall & Project Support",
    short: "Bring recognised brands into malls and commercial developments.",
    lead: "We work with shopping malls, commercial projects, real estate developers, mixed-use developments and lifestyle destinations to increase project value and visitor traffic by bringing high-performing brands into the space.",
    services: [
      "Tenant acquisition",
      "Brand placement",
      "Leasing support",
      "Retail mix planning",
      "Anchor brand acquisition",
      "Occupancy growth strategies",
      "Commercial activation",
      "Retail traffic enhancement",
    ],
    panels: [
      {
        title: "Benefits for mall owners",
        items: [
          "Increased footfall",
          "Higher occupancy",
          "Stronger tenant mix",
          "Enhanced brand image",
          "Improved commercial value",
        ],
      },
    ],
    audiences: ["for-landlords"],
  },
  {
    slug: "landlord-services",
    index: "05",
    title: "Landlord & Property Owner Services",
    navLabel: "Landlord Services",
    short: "Submit a space and we match it to brands actively expanding.",
    lead: "Landlords and property owners submit retail and commercial space to us for brand leasing opportunities. We connect vacant space with growing brands that are actively looking for expansion locations.",
    services: [
      "Property submission & assessment",
      "Tenant matching",
      "Brand introductions",
      "Lease negotiation support",
      "Long-term tenancy planning",
    ],
    panels: [
      {
        title: "Property types",
        items: [
          "Retail shops",
          "Commercial units",
          "Food court spaces",
          "Standalone buildings",
          "Kiosks",
          "Showrooms",
          "Office spaces",
          "Mixed-use properties",
        ],
      },
      {
        title: "Benefits",
        items: [
          "Faster tenant acquisition",
          "Access to established brands",
          "Long-term leasing opportunities",
          "Professional tenant matching",
        ],
      },
    ],
    audiences: ["for-landlords"],
  },
  {
    slug: "marketing-branding",
    index: "06",
    title: "Marketing & Branding Services",
    navLabel: "Marketing & Branding",
    short: "360° marketing — digital, commercial, outdoor and everything between.",
    lead: "Complete 360-degree marketing solutions to increase visibility, customer engagement and market growth — for a brand as a whole, or for a single franchise opening in a single city.",
    services: [
      "Digital marketing",
      "Social media management",
      "Performance marketing",
      "Influencer marketing",
      "Brand strategy",
      "Corporate branding",
      "Video production",
      "Billboard advertising",
      "Outdoor media campaigns",
      "SEO services",
      "Google advertising",
      "Meta advertising",
      "Content marketing",
      "PR & media campaigns",
      "Website development",
      "Mobile application development",
    ],
    panels: [
      {
        title: "Advertising channels",
        items: [
          "Billboards",
          "LED screens",
          "Mall advertising",
          "Social media platforms",
          "Search engines",
          "Influencer collaborations",
          "Retail marketing campaigns",
        ],
      },
    ],
    audiences: ["for-brands", "for-franchise"],
  },
  {
    slug: "technology",
    index: "07",
    title: "Technology & IT Solutions",
    navLabel: "Technology",
    short: "The franchise management software that runs the whole network.",
    lead: "Advanced franchise and business management technology designed to streamline franchise operations, improve communication, automate workflows and optimise performance across every location in a network.",
    services: [
      "Franchise Sales CRM",
      "Applicant Learning Center (ALC)",
      "Franchise Marketing Platform",
      "Digital Library",
      "Franchisee Management System",
      "Franchisee Onboarding",
      "Franchisee Training (LMS)",
      "Franchisee Audit & Compliance",
      "Franchisee Ticketing & Support",
      "Franchisee Finance & Royalty Management",
      "Franchisee CRM",
    ],
    audiences: ["for-brands", "for-franchise"],
  },
];

export function getDivision(slug: string) {
  return divisions.find((d) => d.slug === slug);
}

export function divisionsForAudience(audience: AudienceSlug) {
  return divisions.filter((d) => d.audiences.includes(audience));
}
