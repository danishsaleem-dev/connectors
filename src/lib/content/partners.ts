/**
 * Partners Program content — the vendor side of the business.
 *
 * Same convention as divisions.ts: page bodies read from typed data rather
 * than hardcoded JSX, so wording changes are one edit here.
 *
 * Nothing in this file claims a number we can't stand behind — no "500+
 * partners", no invented ratings. The `stats` band on the homepage is empty
 * for the same reason (see site.ts).
 */

export type PartnerBenefit = {
  title: string;
  body: string;
};

export const partnerBenefits: PartnerBenefit[] = [
  {
    title: "Briefed work, not cold leads",
    body: "You hear from us when a brand we're already placing needs your discipline — with the site, the scope and the timeline already established.",
  },
  {
    title: "Private, not a public listing",
    body: "Your profile is only ever seen by the Connectors team. No public directory, no competitors reading your work, no cold outreach off the back of it.",
  },
  {
    title: "Work across three markets",
    body: "Our brands open across the UK, US and Pakistan. Partners who travel — or who hold local licences — get the projects that need them.",
  },
  {
    title: "Repeat, not one-off",
    body: "A brand that opens ten units doesn't re-tender ten times. Deliver the first well and the rollout tends to follow.",
  },
  {
    title: "Paid on the project, never for access",
    body: "There's no fee to join and no subscription to stay on the bench. We make our money on the expansion deal, not on our partners.",
  },
  {
    title: "One point of contact",
    body: "You deal with the Connectors team, not a chain of intermediaries — scope, access and sign-off all come through the same place.",
  },
];

export type PartnerStep = {
  step: string;
  title: string;
  body: string;
};

export const partnerSteps: PartnerStep[] = [
  {
    step: "01",
    title: "Create your account",
    body: "Sign up with your studio name and email. Takes under a minute, and your portal access is instant.",
  },
  {
    step: "02",
    title: "Build your profile",
    body: "Discipline, specialties, cities served, experience — the details our team needs to know exactly which projects you're right for.",
  },
  {
    step: "03",
    title: "We vet you",
    body: "We review your work against what our brands are actually asking for. Approved partners join the bench our team places projects from — it's never published or browsable.",
  },
  {
    step: "04",
    title: "We connect you",
    body: "When a brand needs your discipline in your market, we make the introduction ourselves — with the site, the scope and the timeline already agreed.",
  },
];

/** The disciplines the programme covers, in the order they appear on the
 * marketing pages. Keys match vendorDisciplineEnum. */
export const partnerDisciplines: { key: string; title: string; body: string }[] = [
  {
    key: "designer",
    title: "Designers",
    body: "Brand identity, store concept and the visual language a rollout repeats.",
  },
  {
    key: "architect",
    title: "Architects",
    body: "Drawings, approvals and the technical package a landlord and a council will both accept.",
  },
  {
    key: "interior",
    title: "Interior Specialists",
    body: "Fit-out, joinery, lighting and the finish that makes a unit feel like the brand.",
  },
  {
    key: "agency",
    title: "Agencies",
    body: "Launch campaigns, local marketing and the opening that gets noticed.",
  },
  {
    key: "consultant",
    title: "Consultants",
    body: "Feasibility, operations, supply chain and franchise structuring.",
  },
  {
    key: "contractor",
    title: "Contractors",
    body: "Build, site management and handing over on the date you said you would.",
  },
];
