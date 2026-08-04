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
import type { Faq } from "@/lib/content/faq";

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
  /** The concrete deliverables — the spine of each service page. Each one
   * carries its own explanation rather than being a bare checklist item, so
   * the page actually says what the work involves. */
  deliverables: { title: string; body: string }[];
  /** Who this particular service is for. Genuinely varies per service,
   * unlike industries, which are company-wide. */
  servedFor: { who: string; body: string }[];
  /** Questions specific to this service, shown beside the video. */
  faqs: Faq[];
  /** Optional per-service explainer video (YouTube/Vimeo link or a direct
   * file URL). Omitted everywhere for now — VideoEmbed renders a "coming
   * soon" placeholder rather than a dead player until one is set. */
  videoUrl?: string | null;
};

export const vendorServices: VendorService[] = [
  {
    slug: "designers",
    title: "Designers",
    body: "Brand identity, store concept and the visual language a rollout repeats.",
    icon: PenTool,
    lead: "The design work that makes the tenth location feel like the first — identity, concept and the guidelines that keep a rollout consistent without making every opening a fresh design project.",
    deliverables: [
      {
        title: "Brand identity & visual system",
        body: "Logo, palette, typography and the rules that hold them together from signage down to packaging.",
      },
      {
        title: "Store concept design",
        body: "The spatial idea — layout, zoning, materials and how a customer moves through the space.",
      },
      {
        title: "Signage & shopfront",
        body: "An exterior treatment that has to work on a mall fascia, a high street and a food court at once.",
      },
      {
        title: "Packaging & collateral",
        body: "Cups, bags, menus, uniforms — everything a customer physically holds that carries the brand.",
      },
      {
        title: "Rollout design guidelines",
        body: "A documented standard, so unit ten doesn't need the original designer back in the room.",
      },
      {
        title: "Renders & material boards",
        body: "Visuals that let a landlord, an investor or a franchisee see it before anything is built.",
      },
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
    faqs: [
      {
        question: "Do we own the design work?",
        answer:
          "Yes. Ownership of the final deliverables transfers to you on completion, and it's set out in the scope before work starts rather than left ambiguous until the invoice.",
      },
      {
        question: "Can you work from an identity we already have?",
        answer:
          "Often that's the better route. If the brand is solid and only its retail expression needs work, the scope starts at store concept rather than rebuilding the identity.",
      },
      {
        question: "How long does a store concept take?",
        answer:
          "It depends on the format and how many people sign off. Once we understand the site and the brief we'll give you a realistic programme rather than an optimistic one.",
      },
      {
        question: "Will the design work in every market we open in?",
        answer:
          "That's what the guidelines are for — we set the standard alongside its tolerances, so a local site can flex to its constraints without the brand drifting.",
      },
    ],
  },
  {
    slug: "architects",
    title: "Architects",
    body: "Drawings, approvals and the technical package a landlord and a council will both accept.",
    icon: Building2,
    lead: "The technical side of an opening: space planning, drawing packages and the approvals that stand between a signed lease and a start on site.",
    deliverables: [
      {
        title: "Space planning & layouts",
        body: "Making the brand's format work in the actual, rarely-rectangular unit you've signed for.",
      },
      {
        title: "Technical drawing packages",
        body: "The full set a contractor can price and build from without filling gaps by guesswork.",
      },
      {
        title: "Building regulations & code",
        body: "Fire, access, ventilation and structure resolved to the standard the jurisdiction requires.",
      },
      {
        title: "Landlord approval submissions",
        body: "Drawings and specifications prepared for what a landlord's technical team will actually approve.",
      },
      {
        title: "Planning & authority applications",
        body: "Change of use, shopfront consent and signage permission — filed and followed through to decision.",
      },
      {
        title: "MEP & structural coordination",
        body: "Services coordinated against the base build, so problems surface on paper instead of on site.",
      },
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
    faqs: [
      {
        question: "Do you handle approvals, or only the drawings?",
        answer:
          "Both. A drawing set that hasn't been through landlord and authority approval isn't much use on its own, so the submissions are part of the scope.",
      },
      {
        question: "Can you work with the landlord's appointed team?",
        answer:
          "Yes, and often we have to. Coordination with the base-build team is usually where a fit-out programme is won or lost.",
      },
      {
        question: "What if the site doesn't fit the brand's standard layout?",
        answer:
          "That's the normal case rather than the exception. Adapting the template while protecting the parts that matter to the brand is most of the work.",
      },
      {
        question: "Do you work across all three of your markets?",
        answer:
          "Codes and approval routes differ by country, so we use partners holding the relevant local qualifications rather than applying one market's assumptions to another.",
      },
    ],
  },
  {
    slug: "interior-specialists",
    title: "Interior Specialists",
    body: "Fit-out, joinery, lighting and the finish that makes a unit feel like the brand.",
    icon: Home,
    lead: "Everything between an approved drawing and a unit that's ready to trade — fit-out, joinery, lighting and the finish quality customers read as the brand.",
    deliverables: [
      {
        title: "Full fit-out delivery",
        body: "One programme taking the unit from approved drawings to ready-to-trade condition.",
      },
      {
        title: "Bespoke joinery & millwork",
        body: "Counters, shelving and fixtures made to the design, not adapted from a catalogue.",
      },
      {
        title: "Lighting design & installation",
        body: "The single biggest lever on how a finished space actually feels to walk into.",
      },
      {
        title: "Flooring, finishes & materials",
        body: "Specified for the wear a working retail or F&B floor genuinely takes, not just how it photographs.",
      },
      {
        title: "Furniture sourcing & installation",
        body: "Procured, delivered and installed against the programme rather than ordered and hoped for.",
      },
      {
        title: "Snagging & handover",
        body: "The defect list closed out before opening, instead of during your first trading weeks.",
      },
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
        body: "Turnkey units that let a tenant open faster than a bare shell would allow.",
      },
    ],
    faqs: [
      {
        question: "Can you work to a fixed budget?",
        answer:
          "Yes, but scope has to be fixed alongside it. We'd rather agree what comes out of the specification early than issue variations once work is underway.",
      },
      {
        question: "How long does a typical fit-out take?",
        answer:
          "It varies with size, condition and access hours. A mall unit restricted to night working runs very differently to a standalone site with full access.",
      },
      {
        question: "Do you handle the landlord's handover requirements?",
        answer:
          "Yes. Making good, compliance documentation and handover packs are part of closing a job properly rather than an afterthought.",
      },
      {
        question: "Can you replicate the same fit-out across multiple sites?",
        answer:
          "That's where this works best. The second and third units are faster and cheaper because the details are already resolved and the suppliers already engaged.",
      },
    ],
  },
  {
    slug: "agencies",
    title: "Agencies",
    body: "Launch campaigns, local marketing and the opening that gets noticed.",
    icon: Megaphone,
    lead: "The marketing that turns an opening date into a queue — campaign strategy, content and the local groundwork that makes a new location known before it trades.",
    deliverables: [
      {
        title: "Opening campaign strategy",
        body: "What gets said, where and in what order, planned backwards from the trading date.",
      },
      {
        title: "Social & digital content",
        body: "The assets a location needs to launch, and to keep posting credibly afterwards.",
      },
      {
        title: "Local & community marketing",
        body: "Catchment-level activity that a national campaign never reaches on its own.",
      },
      {
        title: "Influencer & PR programmes",
        body: "Creators and coverage relevant to the actual neighbourhood, not chosen on follower count.",
      },
      {
        title: "Photography & video",
        body: "Shot at the real site, so the brand isn't launching on stock imagery of somebody else's store.",
      },
      {
        title: "Grand-opening events",
        body: "The launch day itself — planned, staffed and promoted rather than left to footfall.",
      },
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
        body: "One campaign every location can run without rebuilding it locally.",
      },
    ],
    faqs: [
      {
        question: "Do you handle the media spend as well?",
        answer:
          "Media planning and buying sits under Advertisements. The two are usually run together, and we'll coordinate them so campaign and spend aren't planned in isolation.",
      },
      {
        question: "Can franchisees run this locally?",
        answer:
          "Yes, and they should. We build campaigns so a franchisee can run local activity inside the brand's guidelines without needing sign-off on every post.",
      },
      {
        question: "How far ahead should we start?",
        answer:
          "Earlier than most people do. Awareness built before opening week is worth considerably more than the same budget spent on the day itself.",
      },
      {
        question: "What if we're opening in several cities at once?",
        answer:
          "One strategy, localised per market. Rebuilding the campaign city by city is expensive and tends to produce an inconsistent brand.",
      },
    ],
  },
  {
    slug: "consultants",
    title: "Consultants",
    body: "Feasibility, operations, supply chain and franchise structuring.",
    icon: Handshake,
    lead: "The thinking that happens before capital is committed — feasibility, unit economics, operating structure and the franchise model itself.",
    deliverables: [
      {
        title: "Feasibility & market studies",
        body: "Whether the model works in that market, at that rent, at the volume the site can realistically do.",
      },
      {
        title: "Operations manuals & SOPs",
        body: "The documented way of working a franchisee can actually be held to.",
      },
      {
        title: "Supply chain & procurement",
        body: "Sourcing, contracts and logistics that survive scaling past a handful of units.",
      },
      {
        title: "Franchise model & territory structuring",
        body: "Fee structure, territory sizing and terms that make the model sustainable on both sides.",
      },
      {
        title: "Unit economics & P&L modelling",
        body: "The numbers that tell you whether unit twenty is still profitable, not just unit one.",
      },
      {
        title: "Expansion & rollout planning",
        body: "Sequencing openings so cash and management attention don't run out mid-programme.",
      },
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
    faqs: [
      {
        question: "When is the right time to bring in a consultant?",
        answer:
          "Before the decision, not after it. Most of the value is in avoiding a commitment that doesn't work, which is only possible while it's still reversible.",
      },
      {
        question: "Will you tell us if the model isn't ready to franchise?",
        answer:
          "Yes. That's the answer more often than people expect, and it's considerably cheaper to hear before the first franchise agreement is signed.",
      },
      {
        question: "Do you write the franchise agreement?",
        answer:
          "We structure the commercial model — territory, fees, obligations. The legal drafting itself sits with a qualified lawyer in the relevant jurisdiction.",
      },
      {
        question: "How does this differ from your in-house consultancy?",
        answer:
          "It isn't a different standard of work, just a question of which specialist the brief needs. Where a partner is the better fit for a discipline or a market, we bring them in.",
      },
    ],
  },
  {
    slug: "contractors",
    title: "Contractors",
    body: "Build, site management and handing over on the date you said you would.",
    icon: HardHat,
    lead: "Main contracting and site delivery — the trades, the sequencing and the programme discipline that gets a unit handed over on the date it was promised.",
    deliverables: [
      {
        title: "Main contracting & build",
        body: "One party accountable for the build, rather than a dozen trades for you to coordinate.",
      },
      {
        title: "Site management & sequencing",
        body: "Trades scheduled so they aren't waiting on each other, or working over each other's finishes.",
      },
      {
        title: "MEP & specialist trades",
        body: "Mechanical, electrical and plumbing run by people who do retail fit-out daily.",
      },
      {
        title: "Health, safety & compliance",
        body: "Site safety documented to the standard the landlord and the law both require.",
      },
      {
        title: "Programme & cost control",
        body: "Weekly visibility of where the job actually is, not where it was meant to be.",
      },
      {
        title: "Handover & defects",
        body: "Snagging closed out and the unit handed over with its documentation complete.",
      },
    ],
    servedFor: [
      {
        who: "Brands with a rollout programme",
        body: "Repeatable delivery across multiple sites, not a fresh contractor hunt each time.",
      },
      {
        who: "Developers building out schemes",
        body: "Base build and tenant works run to a single coordinated programme.",
      },
      {
        who: "Landlords upgrading units",
        body: "Refurbishment that makes vacant space lettable again.",
      },
    ],
    faqs: [
      {
        question: "How do you handle variations?",
        answer:
          "Priced and agreed before the work happens. Discovering the cost of a change after it's built is how fit-out budgets get away from people.",
      },
      {
        question: "Can you work restricted mall hours?",
        answer:
          "Yes, and the programme is built around it from the outset — night-only access changes the entire schedule, so it can't be treated as a detail.",
      },
      {
        question: "Who's responsible if the programme slips?",
        answer:
          "The contractor carries the programme. Where a delay is caused by landlord access or outstanding approvals, that's flagged early rather than argued about at the end.",
      },
      {
        question: "Do you provide warranties on the work?",
        answer:
          "Yes, with a defects liability period agreed at contract stage and set out in the handover documentation.",
      },
    ],
  },
  {
    slug: "accounts",
    title: "Accounts",
    body: "Bookkeeping, payroll and financial reporting for a growing multi-unit operation.",
    icon: Calculator,
    lead: "The finance function a network needs once it outgrows a spreadsheet — bookkeeping, payroll and reporting that works across units rather than per unit.",
    deliverables: [
      {
        title: "Bookkeeping & management accounts",
        body: "Monthly numbers you can actually act on, rather than a year-end scramble.",
      },
      {
        title: "Payroll processing",
        body: "Staff paid correctly and on time across multiple sites and contract types.",
      },
      {
        title: "VAT / GST & tax filing",
        body: "Returns prepared and filed to the local deadline in each jurisdiction you trade in.",
      },
      {
        title: "Consolidated multi-unit reporting",
        body: "One view across every location, instead of a folder of separate spreadsheets.",
      },
      {
        title: "Royalty & fee reconciliation",
        body: "What each franchisee owes, calculated from the same numbers they report.",
      },
      {
        title: "Budgeting & cash-flow forecasting",
        body: "Knowing whether the next opening is affordable before you commit to the lease.",
      },
    ],
    servedFor: [
      {
        who: "Franchisors tracking a network",
        body: "One consolidated view of performance across every location and franchisee.",
      },
      {
        who: "Franchisees running their units",
        body: "Compliant books and payroll without hiring a finance team for a single site.",
      },
      {
        who: "Brands scaling past the first hire",
        body: "Finance that keeps pace with openings instead of lagging a quarter behind them.",
      },
    ],
    faqs: [
      {
        question: "Can you work with our existing accounting software?",
        answer:
          "Usually yes. Migrating systems mid-growth is disruptive, so we'd rather work with what you have unless it's genuinely holding the business back.",
      },
      {
        question: "Do you handle multiple currencies and jurisdictions?",
        answer:
          "That's the common case for a network across the UK, US and Pakistan. Reporting is consolidated even where the filing obligations stay separate.",
      },
      {
        question: "Is this a replacement for our accountant?",
        answer:
          "It can be, or it can sit alongside them. Plenty of brands keep their statutory accountant and bring in support specifically for multi-unit reporting.",
      },
      {
        question: "How do you handle franchisee royalty disputes?",
        answer:
          "By making the calculation transparent. Reconciling from reported sales, with the method agreed up front, removes most of the argument before it starts.",
      },
    ],
  },
  {
    slug: "audit",
    title: "Audit",
    body: "Compliance checks and brand-standard audits across every location in the network.",
    icon: ClipboardCheck,
    lead: "Independent checks that the standard on paper is the standard in the store — brand, safety and financial audits across every location in a network.",
    deliverables: [
      {
        title: "Brand standard audits",
        body: "A structured check against the standard, scored the same way at every location.",
      },
      {
        title: "Mystery shopping",
        body: "The customer's real experience, not the version a site presents when it knows it's being visited.",
      },
      {
        title: "Health, safety & hygiene inspection",
        body: "The checks that protect your customers and your licence to operate.",
      },
      {
        title: "Financial & royalty audits",
        body: "Verifying that reported sales match what actually went through the till.",
      },
      {
        title: "Corrective action tracking",
        body: "Findings followed through to closure, rather than filed and repeated next quarter.",
      },
      {
        title: "Network scorecards & reporting",
        body: "Comparable performance across every location, visible in one place.",
      },
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
    faqs: [
      {
        question: "How often should locations be audited?",
        answer:
          "It depends on network maturity and risk. New units and known underperformers warrant more frequency than a site with a long clean record.",
      },
      {
        question: "Announced or unannounced?",
        answer:
          "Both have a purpose. Announced audits test capability; unannounced ones test consistency. Most networks need a mix of the two.",
      },
      {
        question: "What happens when a location fails?",
        answer:
          "A corrective action plan with dates and a re-check. An audit that ends at the finding doesn't change anything on the floor.",
      },
      {
        question: "Can franchisees see their own results?",
        answer:
          "They should. Audit works as a management tool when it's transparent, and becomes a source of resentment when it isn't.",
      },
    ],
  },
  {
    slug: "franchise-training",
    title: "Franchise Training",
    body: "Structured onboarding and operational training for every new franchisee.",
    icon: GraduationCap,
    lead: "Structured onboarding that gets a new franchisee from signed agreement to confident operator — and keeps them there as the network grows.",
    deliverables: [
      {
        title: "Franchisee onboarding programmes",
        body: "From signed agreement to ready-to-open, on a defined path rather than ad hoc.",
      },
      {
        title: "Operations & systems training",
        body: "How the business actually runs, taught to the standard it's documented at.",
      },
      {
        title: "Train-the-trainer",
        body: "So the network can train itself as it grows past what head office can personally deliver.",
      },
      {
        title: "Manuals, SOPs & e-learning",
        body: "Reference material that stays available long after the training week ends.",
      },
      {
        title: "Pre-opening readiness assessment",
        body: "An honest check that a franchisee is ready, while there's still time to fix it.",
      },
      {
        title: "Refresher & recertification",
        body: "Standards maintained over years, not just demonstrated once at induction.",
      },
    ],
    servedFor: [
      {
        who: "Franchisors onboarding partners",
        body: "A repeatable programme, instead of the founder personally training every new unit.",
      },
      {
        who: "Franchisees preparing to open",
        body: "Knowing how to run the model before the doors open, rather than learning on customers.",
      },
      {
        who: "Networks standardising operations",
        body: "One curriculum, so every location runs the business the same way.",
      },
    ],
    faqs: [
      {
        question: "How long is a typical onboarding programme?",
        answer:
          "It depends on the complexity of the operation. A food business with production standards takes considerably longer than a service format.",
      },
      {
        question: "Can training be delivered remotely?",
        answer:
          "Partly. Systems and theory work well remotely; hands-on operational training generally doesn't, and pretending otherwise shows up at opening.",
      },
      {
        question: "What if a franchisee isn't ready to open?",
        answer:
          "That's exactly what the readiness assessment is for. Opening an unprepared operator damages the brand, and usually the franchisee too.",
      },
      {
        question: "Do you build the training material or deliver it?",
        answer:
          "Either. Some brands have good material and need delivery capacity; others need the programme built out of what's currently only in the founder's head.",
      },
    ],
  },
  {
    slug: "customer-care-training",
    title: "Customer Care Training",
    body: "Front-of-house standards and service training that protects the brand at every counter.",
    icon: Headphones,
    lead: "The service layer customers actually judge you on — front-of-house standards, complaint recovery and the training that keeps them consistent across every counter.",
    deliverables: [
      {
        title: "Service standards & scripts",
        body: "The defined interaction, so service quality doesn't depend on who happens to be on shift.",
      },
      {
        title: "Front-of-house & counter training",
        body: "Practical training for the staff your customers actually deal with.",
      },
      {
        title: "Complaint handling & recovery",
        body: "Turning the worst moments into retained customers rather than public reviews.",
      },
      {
        title: "Upselling & basket-building",
        body: "More revenue from the footfall you already have, without pressuring the customer.",
      },
      {
        title: "Secret-shopper feedback loops",
        body: "Measurement that shows whether the training actually held once the trainer left.",
      },
      {
        title: "Refresher workshops & coaching",
        body: "Reinforcement, because service standards decay quietly without it.",
      },
    ],
    servedFor: [
      {
        who: "Brands protecting reputation",
        body: "Service quality that doesn't vary by location or by shift.",
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
    faqs: [
      {
        question: "Does this work in high-turnover environments?",
        answer:
          "It has to — that's the environment most retail and F&B operates in. Short, repeatable modules beat a long induction nobody remembers three weeks later.",
      },
      {
        question: "How do you measure whether it worked?",
        answer:
          "Mystery shopping and service scores before and after. Training without measurement is a cost rather than an investment.",
      },
      {
        question: "Can this be delivered in local languages?",
        answer:
          "Yes, and it should be. Service training delivered in a language staff aren't fluent in doesn't change behaviour on the floor.",
      },
      {
        question: "How does this differ from franchise training?",
        answer:
          "Franchise training teaches the operator to run the business. This teaches their staff to serve the customer — a different audience and different content.",
      },
    ],
  },
  {
    slug: "advertisements",
    title: "Advertisements",
    body: "Paid media, outdoor and launch advertising planned around the opening date.",
    icon: BarChart3,
    lead: "Paid media planned backwards from the opening date — search, social, outdoor and in-mall, bought and measured as one campaign rather than scattered spend.",
    deliverables: [
      {
        title: "Paid search & social",
        body: "Demand captured where people are already looking for what you sell.",
      },
      {
        title: "Outdoor, billboard & transit",
        body: "Presence in the catchment before opening day, so the location isn't a surprise.",
      },
      {
        title: "In-mall & on-site advertising",
        body: "The formats that reach people already inside the scheme and close to purchase.",
      },
      {
        title: "Radio, press & local media",
        body: "Channels that still carry real weight in specific markets, particularly outside major cities.",
      },
      {
        title: "Media planning & buying",
        body: "Rates and placements negotiated as one buyer, rather than site by site at retail prices.",
      },
      {
        title: "Performance tracking & reporting",
        body: "What the spend actually returned, broken down by channel rather than reported as a total.",
      },
    ],
    servedFor: [
      {
        who: "Brands entering a market",
        body: "Spend concentrated where it moves footfall during the launch window.",
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
    faqs: [
      {
        question: "What budget do we need to start?",
        answer:
          "It depends entirely on the market and format. We'd rather scope spend against a realistic objective than quote a headline number that means nothing in your catchment.",
      },
      {
        question: "How does this differ from the Agencies service?",
        answer:
          "Agencies build the campaign and the creative; this buys and optimises the media it runs on. Most openings need both, and they work best planned together.",
      },
      {
        question: "Can spend be shared across franchisees?",
        answer:
          "Yes — co-op advertising funds are common. The reporting matters here, because franchisees are entitled to see where their contribution actually went.",
      },
      {
        question: "How soon do we see results?",
        answer:
          "Paid search and social move quickly. Outdoor and brand-level work builds across the campaign and shouldn't be judged on week-one numbers.",
      },
    ],
  },
  {
    slug: "project-handling",
    title: "Project Handling",
    body: "End-to-end project management from signed lease to opening day.",
    icon: ClipboardList,
    lead: "One party accountable for the whole opening — programme, budget, contractors, approvals and the hundred small dependencies between a signed lease and a trading store.",
    deliverables: [
      {
        title: "Programme & critical path",
        body: "The dependencies that genuinely decide the opening date, tracked from day one.",
      },
      {
        title: "Budget & cost control",
        body: "One accountable view of what's committed, what's spent and what's left.",
      },
      {
        title: "Contractor & consultant coordination",
        body: "Designers, architects and trades working to one programme instead of three.",
      },
      {
        title: "Procurement & long-lead items",
        body: "The items that quietly delay openings, identified and ordered before they can.",
      },
      {
        title: "Landlord & authority liaison",
        body: "Approvals, access and compliance chased so they don't sit waiting on someone's desk.",
      },
      {
        title: "Opening-day readiness & sign-off",
        body: "Everything closed out before trading starts, rather than during your first week.",
      },
    ],
    servedFor: [
      {
        who: "Brands opening multiple sites",
        body: "Consistent delivery across a rollout without stretching the internal team past capacity.",
      },
      {
        who: "Franchisees opening a first unit",
        body: "Someone experienced running the build while you learn the business itself.",
      },
      {
        who: "Developers coordinating tenants",
        body: "Multiple fit-outs sequenced so a scheme opens together rather than piecemeal.",
      },
    ],
    faqs: [
      {
        question: "Why not manage the project internally?",
        answer:
          "Plenty of brands do, and should, where they have the capacity. The case for outsourcing is strongest during a rollout, when an internal team would be stretched across several openings at once.",
      },
      {
        question: "At what stage should you be involved?",
        answer:
          "Ideally before the lease is signed. Access, service capacity and landlord obligations are far cheaper to assess before commitment than to discover afterwards.",
      },
      {
        question: "Do you hold the contracts, or do we?",
        answer:
          "Usually you do, and we manage delivery against them. Where you'd rather have a single contractual point of responsibility, that can be structured too.",
      },
      {
        question: "How do you report progress?",
        answer:
          "Against programme and budget, weekly, in a format that surfaces slippage early rather than explaining it late.",
      },
    ],
  },
];

export function getVendorService(slug: string) {
  return vendorServices.find((s) => s.slug === slug);
}
