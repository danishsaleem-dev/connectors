import type { EnquirySource } from "@/lib/db/schema";
import { industries, mission, process } from "@/lib/content/company";
import { divisions } from "@/lib/content/divisions";
import { offices, site } from "@/lib/site";

/**
 * The assistant's entire vocabulary.
 *
 * There is deliberately no language model behind the widget. Every answer a
 * visitor can receive is written here or derived from the same content files
 * the marketing pages render, which means the assistant cannot invent a
 * statistic, a price, or a capability the company hasn't claimed. Anything
 * outside this file is answered by a human — see `HANDOFF` below.
 *
 * Keyword discipline matters: keep terms distinctive. A generic word like
 * "business" or "help" appears in half the questions a visitor might ask, so
 * including it would make one entry win matches it has no business winning.
 */

export type KnowledgeEntry = {
  id: string;
  /** Shown as a suggested chip when this entry is offered up front. */
  question: string;
  answer: string;
  /** Distinctive trigger terms. Multi-word entries score higher on a match. */
  keywords: string[];
  /** Optional deep link offered alongside the answer. */
  link?: { href: string; label: string };
  /**
   * What asking this reveals about the visitor. Used to pre-select the "I am a…"
   * field on the lead form — the visitor can still change it, so this only ever
   * saves them a click, it never decides the answer on their behalf.
   *
   * Type-only import: nothing from the database reaches the browser bundle.
   */
  leadSource?: EnquirySource;
};

const cityList = offices.map((o) => o.address.locality).join(", ");

export const knowledge: KnowledgeEntry[] = [
  /* ---------------------------------------------------------------- */
  /*  The company                                                     */
  /* ---------------------------------------------------------------- */
  {
    id: "what-we-do",
    question: "What does Connectors do?",
    answer:
      "We connect the people and places involved in retail and franchise expansion: brands with locations, franchisees and investors, and landlords and mall owners with brands actively looking to expand. We work both sides of an introduction until it becomes a signed deal.",
    keywords: [
      "what do you do",
      "what does connectors do",
      "who are you",
      "about connectors",
      "explain",
      "overview",
    ],
    link: { href: "/about", label: "More about us" },
  },
  {
    id: "mission",
    question: "What is your mission?",
    answer: mission,
    keywords: ["mission", "vision", "purpose", "values", "goal"],
    link: { href: "/about", label: "About Connectors" },
  },
  {
    id: "industries",
    question: "Which industries do you work in?",
    answer: `We work across ${industries.join(", ")}.`,
    keywords: [
      "industries",
      "sectors",
      "verticals",
      "food beverage",
      "restaurant",
      "fashion",
      "beauty",
      "fitness",
      "hospitality",
      "retail chains",
    ],
    link: { href: "/services", label: "Our services" },
  },
  {
    id: "locations",
    question: "Where are you based?",
    answer: `We operate from offices in ${cityList}, with a network that extends beyond all three.`,
    keywords: [
      "where are you based",
      "offices",
      "location of your office",
      "which country",
      "london",
      "las vegas",
      "lahore",
      "pakistan",
      "united kingdom",
      "usa",
      "address",
    ],
    link: { href: "/contact", label: "Office details" },
  },
  {
    id: "contact",
    question: "How do I get in touch?",
    answer: `You can email ${site.email.general}, call any of our offices, or send us a message from the contact page and we'll come back to you.`,
    keywords: [
      "contact",
      "get in touch",
      "email",
      "phone",
      "call",
      "number",
      "reach you",
      "speak to someone",
      "talk to someone",
    ],
    link: { href: "/contact", label: "Contact us" },
  },
  {
    id: "why-connectors",
    question: "Why work with Connectors?",
    answer:
      "Location, franchise, capital, marketing and technology sit under one platform rather than five vendors who've never spoken to each other — backed by existing relationships with brands, investors, malls, landlords and franchise operators.",
    keywords: [
      "why connectors",
      "why choose",
      "why work with you",
      "what makes you different",
      "competitors",
      "advantage",
    ],
    link: { href: "/about", label: "About Connectors" },
  },

  /* ---------------------------------------------------------------- */
  /*  Per-audience                                                    */
  /* ---------------------------------------------------------------- */
  {
    id: "for-brands",
    question: "I have a brand I want to expand.",
    answer:
      "We source and secure retail locations, turn proven businesses into franchise systems, introduce you to investors, and run the marketing behind an opening. Tell us where you want to open and we'll work the network from both ends.",
    keywords: [
      "expand my brand",
      "new location",
      "open a store",
      "open a branch",
      "site selection",
      "retail space for my brand",
      "grow my brand",
      "new market",
      "multi city",
      "rollout",
    ],
    link: { href: "/for-brands", label: "For brands" },
    leadSource: "brand",
  },
  {
    id: "for-franchise",
    question: "I want to buy a franchise.",
    answer:
      "Tell us your budget, preferred territory, industry interest and experience, and we'll match you against franchise opportunities that actually fit — rather than showing you whatever happens to be available.",
    keywords: [
      "buy a franchise",
      "become a franchisee",
      "franchise opportunity",
      "franchise for sale",
      "own a franchise",
      "franchisee",
      "invest in a franchise",
      "run a franchise",
    ],
    link: { href: "/for-franchise", label: "For franchisees" },
    leadSource: "franchisee",
  },
  {
    id: "for-landlords",
    question: "I have a property to lease.",
    answer:
      "Submit the space with its type, size and location, and we match it against brands actively seeking expansion locations in that category rather than broadcasting it to everyone.",
    keywords: [
      "vacant unit",
      "lease my property",
      "list my property",
      "rent out my shop",
      "landlord",
      "tenant",
      "vacant space",
      "empty unit",
      "commercial unit",
      "my building",
    ],
    link: { href: "/for-landlords", label: "For landlords" },
    leadSource: "landlord",
  },
  {
    id: "for-investors",
    question: "I'm an investor looking for opportunities.",
    answer:
      "We match against ticket size, sector interest and horizon before introducing anything — proven models, expansion-ready brands and multi-unit franchise opportunities rather than a general deal list.",
    keywords: [
      "investor",
      "invest",
      "investment",
      "investment opportunity",
      "invest capital",
      "ticket size",
      "joint venture",
      "equity",
      "funding opportunity",
      "portfolio",
    ],
    link: { href: "/for-investors", label: "For investors" },
    leadSource: "investor",
  },
  {
    id: "malls",
    question: "I run a mall or commercial project.",
    answer:
      "We handle tenant acquisition and brand placement for malls, mixed-use developments and commercial projects — anchor brands, retail mix planning and occupancy growth.",
    keywords: [
      "mall",
      "shopping centre",
      "shopping center",
      "developer",
      "mixed use",
      "anchor tenant",
      "tenant acquisition",
      "occupancy",
      "retail mix",
      "my project",
    ],
    // A mall or project owner is offering space, so they enter the pipeline the
    // same way a landlord does — there's no separate developer enquiry source.
    link: { href: "/services/mall-projects", label: "Mall & project support" },
    leadSource: "landlord",
  },

  /* ---------------------------------------------------------------- */
  /*  Services and process                                            */
  /* ---------------------------------------------------------------- */
  {
    id: "franchise-development",
    question: "Can you turn my business into a franchise?",
    answer:
      "Yes — that's our franchise development division: model design, business structuring, documentation, operations systems, then franchise sales and matchmaking to qualified operators.",
    keywords: [
      "turn my business into a franchise",
      "franchise my business",
      "start franchising",
      "franchise model",
      "franchise development",
      "become a franchisor",
      "scale my business",
    ],
    link: { href: "/services/franchise-development", label: "Franchise development" },
    leadSource: "brand",
  },
  {
    id: "franchise-matching",
    question: "How do you match brands and franchisees?",
    answer:
      "On investment capacity, business experience, preferred territory, industry interest and operational capability — so a brand isn't handed raw leads and a franchisee isn't shown whatever's left.",
    keywords: [
      "how do you match",
      "matching criteria",
      "matchmaking",
      "how does matching work",
      "vetting",
      "qualify",
    ],
    link: { href: "/services/franchise-development", label: "How matching works" },
  },
  {
    id: "process",
    question: "How does the process work?",
    answer: `Five stages: ${process
      .map((p) => p.title.toLowerCase())
      .join(" → ")}. We start with your actual model and economics, match from both ends of the network, structure the agreement, launch with a marketing campaign, then hand over to our franchise technology to run the network.`,
    keywords: [
      "how does it work",
      "what is the process",
      "steps",
      "stages",
      "what happens first",
      "getting started",
      "how do we start",
      "next steps",
    ],
    link: { href: "/services", label: "Our services" },
  },
  {
    id: "services",
    question: "What services do you offer?",
    answer: `Seven divisions: ${divisions.map((d) => d.navLabel).join(", ")}.`,
    keywords: [
      "services",
      "divisions",
      "what do you offer",
      "offerings",
      "capabilities",
      "departments",
    ],
    link: { href: "/services", label: "All services" },
  },
  {
    id: "marketing",
    question: "Do you handle marketing?",
    answer:
      "Yes — 360° marketing: digital and performance marketing, social media, influencer campaigns, brand strategy, video, billboards and outdoor media, SEO, plus website and app development.",
    keywords: [
      "marketing",
      "advertising",
      "branding",
      "social media",
      "seo",
      "billboard",
      "campaign",
      "promotion",
      "influencer",
    ],
    link: { href: "/services/marketing-branding", label: "Marketing & branding" },
  },
  {
    id: "app",
    question: "Tell me about your franchise software.",
    answer:
      "Our franchise technology platform covers the whole network: a franchise sales CRM, applicant learning centre, marketing platform, digital library, franchisee management, structured onboarding, a training LMS, audit and compliance, ticketing and support, and finance and royalty management.",
    keywords: [
      "app",
      "software",
      "technology",
      "platform",
      "crm",
      "lms",
      "training system",
      "royalty",
      "audit",
      "compliance",
      "mobile app",
    ],
    link: { href: "/app", label: "The app" },
  },
  {
    id: "after-signing",
    question: "What happens after an agreement is signed?",
    answer:
      "Onboarding is structured rather than improvised: a dedicated Applicant Learning Center, a full training LMS, a digital library of manuals and SOPs, and ongoing audit, compliance and support through the same platform.",
    keywords: [
      "after signing",
      "after the agreement",
      "onboarding",
      "training",
      "support after",
      "what next after",
      "post signing",
    ],
    link: { href: "/app", label: "The platform" },
  },
  {
    id: "small-brands",
    question: "Do you only work with large brands?",
    answer:
      "No. Our franchise development work is built for brands turning a single successful location into a scalable system, as well as established chains entering new markets. Tell us where you are and we'll say honestly whether we're a fit.",
    keywords: [
      "small brand",
      "single location",
      "one branch",
      "startup",
      "new business",
      "only large brands",
      "too small",
      "just started",
    ],
    link: { href: "/for-brands", label: "For brands" },
    leadSource: "brand",
  },
  {
    id: "portal",
    question: "How do I access the partner portal?",
    answer:
      "Partners sign in from the portal login. Brands, franchisees, landlords and mall developers can register there; investor accounts are set up by our team directly.",
    keywords: [
      "portal",
      "login",
      "log in",
      "sign in",
      "my account",
      "register",
      "sign up",
      "dashboard",
    ],
    link: { href: "/portal/login", label: "Partner login" },
  },
];

/**
 * Questions we consciously refuse to answer from a script, because a wrong or
 * generic answer here costs a real deal. Matching one of these routes straight
 * to a person, with the reason shown so the visitor isn't left guessing.
 */
export const escalations: { id: string; keywords: string[]; answer: string }[] = [
  {
    id: "pricing",
    keywords: [
      "price",
      "pricing",
      "cost",
      "fee",
      "fees",
      "how much",
      "commission",
      "charges",
      "rate",
      "budget required",
      "minimum investment",
    ],
    answer:
      "We don't publish fees, and I'd rather not guess at one — what it costs depends entirely on the division, the market and the scope of work. This is a question for one of our representatives, who can give you a real figure.",
  },
  {
    id: "timeline",
    keywords: [
      "how long",
      "timeline",
      "how quickly",
      "how soon",
      "turnaround",
      "when can you",
      "duration",
      "lead time",
    ],
    answer:
      "Honestly, it depends too much on the market and the brief for me to give you a number worth trusting. One of our representatives can walk you through a realistic timeline for your situation.",
  },
  {
    id: "legal",
    keywords: [
      // "contract" and "legal" escalate on their own. A scripted answer about
      // what's in an agreement is exactly the kind of wrong that costs a deal,
      // so any question near the paperwork goes to a person.
      "legal",
      "contract",
      "contract terms",
      "legal advice",
      "lawyer",
      "liability",
      "dispute",
      "terminate the agreement",
      "sue",
      "tax",
      "visa",
    ],
    answer:
      "That's not something I should answer from a script — it needs a proper conversation with our team, and in some cases your own legal or tax advisor.",
  },
  {
    id: "careers",
    keywords: [
      "job",
      "jobs",
      "career",
      "careers",
      "hiring",
      "vacancy",
      "internship",
      "apply to work",
      "recruitment",
      "cv",
      "resume",
    ],
    answer:
      "We don't have a careers page yet, so I can't point you at open roles. Email us and it'll reach the right person.",
  },
];

/** Small talk, so a greeting doesn't read as an unanswered question. */
export const smallTalk: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["hi", "hello", "hey", "salam", "assalam", "good morning", "good evening"],
    answer: "Hello. Ask me anything about what Connectors does, or pick one of the questions below.",
  },
  {
    keywords: ["thanks", "thank you", "thankyou", "cheers", "appreciate"],
    answer: "Any time. Anything else you'd like to know?",
  },
  {
    keywords: ["bye", "goodbye", "see you", "later"],
    answer: "Thanks for stopping by. The contact page is there whenever you need us.",
  },
];

export const GREETING =
  "Hi — I can answer common questions about Connectors: what we do, our services, industries and offices. For anything specific to your business, I'll put you in touch with one of our representatives.";

export const HANDOFF =
  "That one's beyond what I can answer here. We will connect you with one of our representatives — they'll be able to help properly.";

/** Chips shown when the panel opens. Deliberately one per audience plus the
 * two most-asked general questions, so a visitor sees themselves in the list. */
export const SUGGESTED_IDS = [
  "what-we-do",
  "for-brands",
  "for-franchise",
  "for-landlords",
  "for-investors",
  "services",
] as const;
