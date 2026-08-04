import {
  BarChart3,
  Building2,
  Calculator,
  ClipboardCheck,
  ClipboardList,
  GraduationCap,
  Handshake,
  HardHat,
  Headphones,
  Home,
  Megaphone,
  PenTool,
  type LucideIcon,
} from "lucide-react";

/** The full catalog on /vendor-services — every discipline a brand might
 * need brought in through the Partners Program, from design/build through
 * to the operational services a growing network needs after it opens.
 *
 * Each entry also drives its own landing page at /vendor-services/<slug>,
 * same data-not-JSX convention as divisions.ts. These pages describe the
 * *service* only — they never name, list or profile an actual vendor, since
 * partner profiles are private by design (see BACKEND.md).
 */
export type VendorService = {
  slug: string;
  title: string;
  /** One line, used on the catalog cards and in nav. */
  body: string;
  icon: LucideIcon;
  /** Opening paragraph on the service's own page. */
  lead: string;
  /** The concrete deliverables — the spine of each service page. */
  details: string[];
  /** Who this particular service is for. Genuinely varies per service,
   * unlike industries, which are company-wide. */
  servedFor: { who: string; body: string }[];
};

export const vendorServices: VendorService[] = [
  {
    slug: "designers",
    title: "Designers",
    body: "Brand identity, store concept and the visual language a rollout repeats.",
    icon: PenTool,
    lead: "The design work that makes the tenth location feel like the first — identity, concept and the guidelines that keep a rollout consistent without making every opening a fresh design project.",
    details: [
      "Brand identity & visual systems",
      "Store concept and layout design",
      "Signage, wayfinding and shopfront",
      "Packaging, uniforms and collateral",
      "Design guidelines for repeatable rollout",
      "Concept renders and material boards",
    ],
    servedFor: [
      {
        who: "Brands opening a flagship",
        body: "A first location that sets the visual standard everything after it is measured against.",
      },
      {
        who: "Franchisors standardising a network",
        body: "One design language documented tightly enough that a franchisee can't drift from it.",
      },
      {
        who: "Landlords repositioning a scheme",
        body: "Concept work that makes a tired unit or floor attractive to the tenants you actually want.",
      },
    ],
  },
  {
    slug: "architects",
    title: "Architects",
    body: "Drawings, approvals and the technical package a landlord and a council will both accept.",
    icon: Building2,
    lead: "The technical side of an opening: space planning, drawing packages and the approvals that stand between a signed lease and a start on site.",
    details: [
      "Space planning and unit layouts",
      "Full technical drawing packages",
      "Building regulation and code compliance",
      "Landlord approval submissions",
      "Planning and local authority applications",
      "MEP and structural coordination",
    ],
    servedFor: [
      {
        who: "Brands fitting out new units",
        body: "A drawing set that survives landlord review and council scrutiny without a redesign.",
      },
      {
        who: "Developers delivering shell and core",
        body: "Coordination between the base build and what an incoming tenant actually needs.",
      },
      {
        who: "Franchisees adapting a template",
        body: "Taking the brand's standard layout and making it work in a real, irregular space.",
      },
    ],
  },
  {
    slug: "interior-specialists",
    title: "Interior Specialists",
    body: "Fit-out, joinery, lighting and the finish that makes a unit feel like the brand.",
    icon: Home,
    lead: "Everything between an approved drawing and a unit that's ready to trade — fit-out, joinery, lighting and the finish quality customers read as the brand.",
    details: [
      "Full fit-out delivery",
      "Bespoke joinery and millwork",
      "Lighting design and installation",
      "Flooring, finishes and material supply",
      "Furniture sourcing and installation",
      "Snagging and handover",
    ],
    servedFor: [
      {
        who: "Brands opening new locations",
        body: "A finish that matches the concept, on a programme that hits the trading date.",
      },
      {
        who: "Franchisees building their unit",
        body: "Fit-out delivered to brand standard, so the opening audit isn't a fight.",
      },
      {
        who: "Landlords offering fitted space",
        body: "Turnkey units that let a tenant open faster than a shell would allow.",
      },
    ],
  },
  {
    slug: "agencies",
    title: "Agencies",
    body: "Launch campaigns, local marketing and the opening that gets noticed.",
    icon: Megaphone,
    lead: "The marketing that turns an opening date into a queue — campaign strategy, content and the local groundwork that makes a new location known before it trades.",
    details: [
      "Opening campaign strategy",
      "Social and digital content production",
      "Local and community marketing",
      "Influencer and PR programmes",
      "Photography and video",
      "Grand-opening events and activations",
    ],
    servedFor: [
      {
        who: "Brands entering a new market",
        body: "Awareness built in a city where nobody knows the name yet.",
      },
      {
        who: "Franchisees launching a territory",
        body: "Local marketing that works within brand guidelines instead of against them.",
      },
      {
        who: "Networks running national campaigns",
        body: "One campaign that every location can run without rebuilding it locally.",
      },
    ],
  },
  {
    slug: "consultants",
    title: "Consultants",
    body: "Feasibility, operations, supply chain and franchise structuring.",
    icon: Handshake,
    lead: "The thinking that happens before capital is committed — feasibility, unit economics, operating structure and the franchise model itself.",
    details: [
      "Feasibility and market studies",
      "Operations manuals and SOPs",
      "Supply chain and procurement setup",
      "Franchise model and territory structuring",
      "Unit economics and P&L modelling",
      "Expansion and rollout planning",
    ],
    servedFor: [
      {
        who: "Brands preparing to franchise",
        body: "Turning one successful location into a model somebody else can run profitably.",
      },
      {
        who: "Franchisees evaluating an opportunity",
        body: "An honest read on the numbers before the agreement is signed.",
      },
      {
        who: "Investors assessing a business",
        body: "Independent diligence on the operating model behind the pitch.",
      },
    ],
  },
  {
    slug: "contractors",
    title: "Contractors",
    body: "Build, site management and handing over on the date you said you would.",
    icon: HardHat,
    lead: "Main contracting and site delivery — the trades, the sequencing and the programme discipline that gets a unit handed over on the date it was promised.",
    details: [
      "Main contracting and build delivery",
      "Site management and trade sequencing",
      "MEP and specialist subcontractors",
      "Health, safety and site compliance",
      "Programme and cost control",
      "Handover and defects resolution",
    ],
    servedFor: [
      {
        who: "Brands with a rollout programme",
        body: "Repeatable delivery across multiple sites, not a fresh contractor hunt each time.",
      },
      {
        who: "Developers building out schemes",
        body: "Base build and tenant works run to one programme.",
      },
      {
        who: "Landlords upgrading units",
        body: "Refurbishment that makes vacant space lettable again.",
      },
    ],
  },
  {
    slug: "accounts",
    title: "Accounts",
    body: "Bookkeeping, payroll and financial reporting for a growing multi-unit operation.",
    icon: Calculator,
    lead: "The finance function a network needs once it outgrows a spreadsheet — bookkeeping, payroll and reporting that works across units rather than per unit.",
    details: [
      "Bookkeeping and management accounts",
      "Payroll processing",
      "VAT / GST and tax filing",
      "Consolidated multi-unit reporting",
      "Royalty and fee reconciliation",
      "Budgeting and cash-flow forecasting",
    ],
    servedFor: [
      {
        who: "Franchisors tracking a network",
        body: "One consolidated view of performance across every location and franchisee.",
      },
      {
        who: "Franchisees running their units",
        body: "Compliant books and payroll without hiring a finance team for one site.",
      },
      {
        who: "Brands scaling past the first hire",
        body: "Finance that keeps up with the openings instead of lagging a quarter behind.",
      },
    ],
  },
  {
    slug: "audit",
    title: "Audit",
    body: "Compliance checks and brand-standard audits across every location in the network.",
    icon: ClipboardCheck,
    lead: "Independent checks that the standard on paper is the standard in the store — brand, safety and financial audits across every location in a network.",
    details: [
      "Brand standard audits",
      "Mystery shopping programmes",
      "Health, safety and hygiene inspection",
      "Financial and royalty audits",
      "Corrective action tracking",
      "Network-wide scorecards and reporting",
    ],
    servedFor: [
      {
        who: "Franchisors protecting the brand",
        body: "Evidence of what's actually happening in units you don't operate yourself.",
      },
      {
        who: "Brands with multi-site operations",
        body: "Consistency checks that catch drift before a customer does.",
      },
      {
        who: "Investors doing diligence",
        body: "An independent view of operational quality before capital goes in.",
      },
    ],
  },
  {
    slug: "franchise-training",
    title: "Franchise Training",
    body: "Structured onboarding and operational training for every new franchisee.",
    icon: GraduationCap,
    lead: "Structured onboarding that gets a new franchisee from signed agreement to confident operator — and keeps them there as the network grows.",
    details: [
      "Franchisee onboarding programmes",
      "Operations and systems training",
      "Train-the-trainer for network scale",
      "Manuals, SOPs and e-learning content",
      "Pre-opening readiness assessment",
      "Refresher and recertification cycles",
    ],
    servedFor: [
      {
        who: "Franchisors onboarding partners",
        body: "A repeatable programme instead of the founder personally training every new unit.",
      },
      {
        who: "Franchisees preparing to open",
        body: "Knowing how to run the model before the doors open, not after.",
      },
      {
        who: "Networks standardising operations",
        body: "One curriculum, so every location runs the business the same way.",
      },
    ],
  },
  {
    slug: "customer-care-training",
    title: "Customer Care Training",
    body: "Front-of-house standards and service training that protects the brand at every counter.",
    icon: Headphones,
    lead: "The service layer customers actually judge you on — front-of-house standards, complaint recovery and the training that keeps them consistent across every counter.",
    details: [
      "Service standards and scripts",
      "Front-of-house and counter training",
      "Complaint handling and service recovery",
      "Upselling and basket-building",
      "Secret-shopper feedback loops",
      "Refresher workshops and coaching",
    ],
    servedFor: [
      {
        who: "Brands protecting reputation",
        body: "Service quality that doesn't vary by who happens to be on shift.",
      },
      {
        who: "Franchisees building a team",
        body: "New staff trained to standard quickly, in a high-turnover environment.",
      },
      {
        who: "Network operations teams",
        body: "A common service benchmark to manage and measure against.",
      },
    ],
  },
  {
    slug: "advertisements",
    title: "Advertisements",
    body: "Paid media, outdoor and launch advertising planned around the opening date.",
    icon: BarChart3,
    lead: "Paid media planned backwards from the opening date — search, social, outdoor and in-mall, bought and measured as one campaign rather than scattered spend.",
    details: [
      "Paid search and social advertising",
      "Outdoor, billboard and transit",
      "In-mall and on-site advertising",
      "Radio, press and local media",
      "Media planning and buying",
      "Performance tracking and reporting",
    ],
    servedFor: [
      {
        who: "Brands entering a market",
        body: "Spend concentrated where it moves footfall in the launch window.",
      },
      {
        who: "Franchisees driving local trade",
        body: "Local media buying at rates a single operator couldn't negotiate alone.",
      },
      {
        who: "Networks running co-op funds",
        body: "Shared advertising budgets spent accountably across locations.",
      },
    ],
  },
  {
    slug: "project-handling",
    title: "Project Handling",
    body: "End-to-end project management from signed lease to opening day.",
    icon: ClipboardList,
    lead: "One party accountable for the whole opening — programme, budget, contractors, approvals and the hundred small dependencies between a signed lease and a trading store.",
    details: [
      "Programme and critical path management",
      "Budget and cost control",
      "Contractor and consultant coordination",
      "Procurement and long-lead item tracking",
      "Landlord and authority liaison",
      "Opening-day readiness and sign-off",
    ],
    servedFor: [
      {
        who: "Brands opening multiple sites",
        body: "Consistent delivery across a rollout without stretching the internal team.",
      },
      {
        who: "Franchisees opening a first unit",
        body: "Someone experienced running the build while you learn the business.",
      },
      {
        who: "Developers coordinating tenants",
        body: "Multiple fit-outs sequenced so a scheme opens together.",
      },
    ],
  },
];

export function getVendorService(slug: string) {
  return vendorServices.find((s) => s.slug === slug);
}
