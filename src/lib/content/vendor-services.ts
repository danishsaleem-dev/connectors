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
 * to the operational services a growing network needs after it opens. */
export type VendorService = {
  title: string;
  body: string;
  icon: LucideIcon;
};

export const vendorServices: VendorService[] = [
  {
    title: "Designers",
    body: "Brand identity, store concept and the visual language a rollout repeats.",
    icon: PenTool,
  },
  {
    title: "Architects",
    body: "Drawings, approvals and the technical package a landlord and a council will both accept.",
    icon: Building2,
  },
  {
    title: "Interior Specialists",
    body: "Fit-out, joinery, lighting and the finish that makes a unit feel like the brand.",
    icon: Home,
  },
  {
    title: "Agencies",
    body: "Launch campaigns, local marketing and the opening that gets noticed.",
    icon: Megaphone,
  },
  {
    title: "Consultants",
    body: "Feasibility, operations, supply chain and franchise structuring.",
    icon: Handshake,
  },
  {
    title: "Contractors",
    body: "Build, site management and handing over on the date you said you would.",
    icon: HardHat,
  },
  {
    title: "Accounts",
    body: "Bookkeeping, payroll and financial reporting for a growing multi-unit operation.",
    icon: Calculator,
  },
  {
    title: "Audit",
    body: "Compliance checks and brand-standard audits across every location in the network.",
    icon: ClipboardCheck,
  },
  {
    title: "Franchise Training",
    body: "Structured onboarding and operational training for every new franchisee.",
    icon: GraduationCap,
  },
  {
    title: "Customer Care Training",
    body: "Front-of-house standards and service training that protects the brand at every counter.",
    icon: Headphones,
  },
  {
    title: "Advertisements",
    body: "Paid media, outdoor and launch advertising planned around the opening date.",
    icon: BarChart3,
  },
  {
    title: "Project Handling",
    body: "End-to-end project management from signed lease to opening day.",
    icon: ClipboardList,
  },
];
