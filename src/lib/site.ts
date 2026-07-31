/**
 * Single source of truth for everything that is "the business" rather than
 * "the code": offices, contact details, social links, headline numbers.
 *
 * Office phone numbers and addresses below are REAL and confirmed.
 * Anything still tagged `TODO` is a placeholder and must be replaced before
 * launch. Nothing else in the codebase hardcodes a number or address.
 */

export type Office = {
  id: "uk" | "us" | "pk";
  label: string;
  /** ISO 3166-1 alpha-2, used for schema.org and the flag-free country line. */
  countryCode: string;
  phone: {
    display: string;
    /** tel: href — international format, no spaces or symbols. */
    href: string;
  };
  address: {
    street: string;
    locality: string;
    /** State / region, where the country uses one. */
    region?: string;
    postalCode?: string;
    country: string;
  };
};

export const offices: Office[] = [
  {
    id: "uk",
    label: "UK Office",
    countryCode: "GB",
    phone: { display: "+44 7894 560314", href: "+447894560314" },
    address: {
      street: "26-28 Mount Row",
      locality: "London",
      postalCode: "W1K 3SQ",
      country: "United Kingdom",
    },
  },
  {
    id: "us",
    label: "US Office",
    countryCode: "US",
    phone: { display: "+1 702 964 1853", href: "+17029641853" },
    address: {
      street: "8870 S Maryland Pkwy, Suite 130",
      locality: "Las Vegas",
      region: "NV",
      postalCode: "89123",
      country: "United States",
    },
  },
  {
    id: "pk",
    label: "Pakistan Office",
    countryCode: "PK",
    phone: { display: "+92 300 6885680", href: "+923006885680" },
    address: {
      street: "23 Hunza Block, Allama Iqbal Town",
      locality: "Lahore",
      country: "Pakistan",
    },
  },
];

/** The office used for single-contact contexts (CTA strips, schema.org). */
export const primaryOffice = offices[0];

export const site = {
  name: "Connectors",
  tagline: "Connecting Growth Through Opportunities",
  promise: "We Don't Just Connect Businesses — We Create Growth.",
  description:
    "Connectors is a business expansion, franchise development, retail leasing and investment facilitation company. We connect brands with locations, franchisees and investors — and connect landlords with the brands that fill their space.",

  offices,
  primaryOffice,

  email: {
    general: "info@connectors.group",
    brands: "brands@connectors.group",
    franchise: "franchise@connectors.group",
    landlords: "landlords@connectors.group",
    investors: "investors@connectors.group",
  },

  /** TODO: replace with real profiles, or delete the ones that don't exist. */
  socials: {
    linkedin: { label: "LinkedIn", url: "https://linkedin.com/company/connectors" },
    instagram: { label: "Instagram", url: "https://instagram.com/connectors" },
    facebook: { label: "Facebook", url: "https://facebook.com/connectors" },
  },

  /**
   * TODO: replace with the real App Store / Google Play listing URLs once the
   * app is published. Left as "#" renders the store buttons in a "coming
   * soon" state rather than linking anywhere — see StoreBadge in
   * AudienceAppPromo.tsx.
   */
  appLinks: {
    ios: "#",
    android: "#",
  },
} as const;

/** "26-28 Mount Row, London W1K 3SQ, United Kingdom" */
export function formatAddress(office: Office) {
  const { street, locality, region, postalCode, country } = office.address;
  const middle = [locality, region, postalCode].filter(Boolean).join(" ");
  return [street, middle, country].filter(Boolean).join(", ");
}

/**
 * Headline numbers.
 *
 * Deliberately empty. Inventing credibility statistics ("200+ brands
 * connected") on a live corporate site is a real-world misrepresentation, so
 * the homepage renders a qualitative strip instead whenever this is empty.
 * Populate it with true figures and the numeric stat band appears automatically.
 */
export const stats: { value: string; label: string }[] = [];

/** The four doors into the business — used by the nav, homepage and footer. */
export const audiences = [
  {
    slug: "for-brands",
    nav: "For Brands",
    title: "Brands",
    lead: "Expand into the right locations, turn your business into a franchise, and meet investors ready to back it.",
  },
  {
    slug: "for-franchise",
    nav: "For Franchisees",
    title: "Franchisees",
    lead: "Find a franchise matched to your budget, territory and experience — with the training and systems to run it.",
  },
  {
    slug: "for-landlords",
    nav: "For Landlords",
    title: "Landlords & Developers",
    lead: "Fill vacant retail, mall and commercial space with established brands actively looking to expand.",
  },
  {
    slug: "for-investors",
    nav: "For Investors",
    title: "Investors",
    lead: "Access proven business models, expansion-ready brands and multi-unit franchise opportunities.",
  },
] as const;

export type AudienceSlug = (typeof audiences)[number]["slug"];
