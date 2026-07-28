/**
 * The franchise technology ecosystem, transcribed from the corporate profile.
 * Used by the homepage app section and the dedicated /app page.
 *
 * `icon` values are lucide-react export names — imported explicitly at the call
 * site rather than dynamically, so tree-shaking still works.
 */

export type AppModule = {
  slug: string;
  name: string;
  short: string;
  body: string;
  icon: string;
  /** Who primarily lives in this module day to day. */
  audience: "brand" | "franchisee" | "both";
};

export const appModules: AppModule[] = [
  {
    slug: "franchise-sales-crm",
    name: "Franchise Sales CRM",
    short: "Leads, pipeline and investor conversations in one place.",
    body: "Manage franchise leads, inquiries, sales pipelines and investor communications from a centralised system, so no enquiry goes cold in someone's inbox.",
    icon: "Workflow",
    audience: "brand",
  },
  {
    slug: "applicant-learning-center",
    name: "Applicant Learning Center",
    short: "Applicants learn the model before they ever sign.",
    body: "A dedicated learning portal where franchise applicants work through the business model, operations and onboarding process — qualifying themselves in and out before you spend time on them.",
    icon: "GraduationCap",
    audience: "franchisee",
  },
  {
    slug: "marketing-platform",
    name: "Franchise Marketing Platform",
    short: "Campaigns and lead generation, automated.",
    body: "Automated systems for franchise promotion, campaigns, lead generation and sales conversion — run centrally, deployed per territory.",
    icon: "Megaphone",
    audience: "brand",
  },
  {
    slug: "digital-library",
    name: "Digital Library",
    short: "Manuals, contracts, SOPs and brand assets.",
    body: "Centralised storage for operational manuals, contracts, SOPs, branding assets and franchise documentation — one current version, not fourteen forwarded copies.",
    icon: "Library",
    audience: "both",
  },
  {
    slug: "franchisee-management",
    name: "Franchisee Management System",
    short: "Operations and KPIs across every location.",
    body: "Monitor franchise operations, communications, KPIs and performance across all locations, with the network view a franchisor actually needs to run it.",
    icon: "LayoutDashboard",
    audience: "brand",
  },
  {
    slug: "onboarding",
    name: "Franchisee Onboarding",
    short: "A structured path from signed to open.",
    body: "Structured onboarding for smooth franchise setup and operational launch, so every new location opens the same way rather than however that month went.",
    icon: "Rocket",
    audience: "franchisee",
  },
  {
    slug: "training-lms",
    name: "Franchisee Training (LMS)",
    short: "Train teams and managers to one standard.",
    body: "A comprehensive learning management system for training franchise teams and management — consistent standards across every territory.",
    icon: "BookOpen",
    audience: "franchisee",
  },
  {
    slug: "audit-compliance",
    name: "Audit & Compliance",
    short: "Inspections, standards and brand consistency.",
    body: "Track operational standards, inspections, brand consistency and compliance requirements — the mechanism that keeps a growing network on-brand.",
    icon: "ClipboardCheck",
    audience: "both",
  },
  {
    slug: "ticketing-support",
    name: "Ticketing & Support",
    short: "A real support desk for franchisees.",
    body: "Support desk systems for franchise operational issues, requests and technical assistance, with a record of what was asked and what was done about it.",
    icon: "LifeBuoy",
    audience: "both",
  },
  {
    slug: "finance-royalty",
    name: "Finance & Royalty Management",
    short: "Royalties, invoices and revenue tracking.",
    body: "Manage royalties, invoices, payments, financial reporting and franchise revenue tracking without a spreadsheet per franchisee.",
    icon: "Receipt",
    audience: "both",
  },
  {
    slug: "franchisee-crm",
    name: "Franchisee CRM",
    short: "The relationship, not just the contract.",
    body: "Centralised relationship management for franchise communication and engagement across the life of the agreement.",
    icon: "Users",
    audience: "brand",
  },
];

/** The short pitch used on the homepage section and the /app hero. */
export const appPitch = {
  eyebrow: "The Connectors app",
  title: "Your whole franchise network, in one app.",
  body: "Every part of running a franchise system — sales pipeline, onboarding, training, compliance, support and royalties — in a single platform. Brands see the whole network. Franchisees see exactly what they need.",
  brandView: [
    "Every location and its performance",
    "Franchise pipeline and applicant progress",
    "Agreements, documents and compliance status",
    "Royalty and revenue reporting",
  ],
  franchiseeView: [
    "Training, manuals and brand assets",
    "Onboarding checklist through to opening",
    "Direct line to head-office support",
    "Invoices, payments and statements",
  ],
};
