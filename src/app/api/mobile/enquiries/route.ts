import { NextResponse } from "next/server";
import { Resend } from "resend";
import { recordEnquiry } from "@/lib/actions/record-enquiry";
import { verifyMobileSession } from "@/lib/auth/mobile-session";
import { site } from "@/lib/site";
import { brandEnquirySchema, type BrandEnquiryData } from "@/lib/schemas/brand-enquiry";
import { franchiseEnquirySchema, type FranchiseEnquiryData } from "@/lib/schemas/franchise-enquiry";
import { investorEnquirySchema, type InvestorEnquiryData } from "@/lib/schemas/investor-enquiry";
import { landlordEnquirySchema, type LandlordEnquiryData } from "@/lib/schemas/landlord-enquiry";
import type { EnquirySource } from "@/lib/db/schema";

export const runtime = "nodejs";

function withOther(values: string[], other?: string) {
  return [...values.filter((v) => v !== "Other"), values.includes("Other") ? other : null].filter(
    Boolean,
  );
}

/** Turns a set of (label, present?) pairs into one "Attachments: X, Y"
 * line, or null when nothing was attached — the summary is plain text
 * (see AdminEnquiryDetailPage), so this names what came in rather than
 * linking to it; the actual Storage paths still land in `payload` either
 * way, they're just not surfaced as clickable links yet. */
function attachmentsLine(entries: [string, boolean][]): string | null {
  const present = entries.filter(([, has]) => has).map(([label]) => label);
  return present.length > 0 ? `Attachments: ${present.join(", ")}` : null;
}

const SOURCES: Record<
  string,
  {
    // The enquiries.source enum spells this "franchisee", but the app (and
    // this API's own external contract) says "franchise" everywhere else —
    // matching for-franchise / franchiseSteps naming. This is the one place
    // that translation happens, rather than as a runtime cast.
    dbSource: EnquirySource;
    schema:
      | typeof brandEnquirySchema
      | typeof franchiseEnquirySchema
      | typeof landlordEnquirySchema
      | typeof investorEnquirySchema;
    contactEmail: string;
    subject: (name: string) => string;
    // Each branch's data/contact shape is that source's own zod-inferred
    // type (brand uses contactName, the rest use fullName, etc.) — `any`
    // here rather than a lowest-common-denominator type that would just
    // need casting back inside every branch anyway.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    summarize: (data: any) => string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contact: (data: any) => { name: string; email: string; phone: string; companyName?: string };
  }
> = {
  brand: {
    dbSource: "brand",
    schema: brandEnquirySchema,
    contactEmail: site.email.brands,
    subject: (name) => `Brand expansion request — ${name}`,
    summarize: (data: BrandEnquiryData) =>
      [
        `Brand: ${data.brandName}`,
        `Company: ${data.companyName}`,
        `Contact: ${data.contactName}${data.designation ? ` (${data.designation})` : ""}`,
        `Mobile: ${data.mobile}`,
        `Email: ${data.email}`,
        data.website ? `Website/Social: ${data.website}` : null,
        "",
        `Required cities: ${withOther(data.cities, data.otherCity).join(", ")}`,
        `Preferred areas: ${data.preferredAreas}`,
        "",
        `Outlet type: ${withOther(data.outletTypes, data.otherOutletType).join(", ")}`,
        `Required area: ${data.areaMin} - ${data.areaMax} sq ft`,
        `Preferred location type: ${data.locationTypes.join(", ")}`,
        "",
        `Monthly rental budget: ${data.rentalBudget}`,
        data.additionalServices?.length
          ? `Additional services: ${data.additionalServices.join(", ")}`
          : null,
        "",
        attachmentsLine([
          ["Company Profile", Boolean(data.companyProfilePath)],
          ["Brand Logo", Boolean(data.brandLogoPath)],
          [
            `Outlet Photos (${data.outletPhotoPaths?.length ?? 0})`,
            Boolean(data.outletPhotoPaths?.length),
          ],
        ]),
        "Submitted via the Connectors app.",
      ]
        .filter((l): l is string => l !== null)
        .join("\n"),
    contact: (d) => ({
      name: d.contactName ?? "",
      email: d.email,
      phone: d.mobile,
      companyName: d.companyName,
    }),
  },
  franchise: {
    dbSource: "franchisee",
    schema: franchiseEnquirySchema,
    contactEmail: site.email.franchise,
    subject: (name) => `Franchise application — ${name}`,
    summarize: (data: FranchiseEnquiryData) =>
      [
        `Name: ${data.fullName}`,
        `Email: ${data.email}`,
        `Mobile: ${data.mobile}`,
        `City of residence: ${data.cityOfResidence}`,
        "",
        `Investment capacity: ${data.investmentCapacity}`,
        `Business experience: ${data.businessExperience}`,
        data.currentBusiness ? `Current business: ${data.currentBusiness}` : null,
        "",
        `Industry interest: ${data.industryInterest.join(", ")}`,
        `Preferred territory: ${withOther(data.cities, data.otherCity).join(", ")}`,
        `Operational plan: ${data.operationalCapability}`,
        "",
        attachmentsLine([["CV / Business Profile", Boolean(data.cvPath)]]),
        "Submitted via the Connectors app.",
      ]
        .filter((l): l is string => l !== null)
        .join("\n"),
    contact: (d) => ({ name: d.fullName ?? "", email: d.email, phone: d.mobile }),
  },
  landlord: {
    dbSource: "landlord",
    schema: landlordEnquirySchema,
    contactEmail: site.email.landlords,
    subject: (name) => `Property submission — ${name}`,
    summarize: (data: LandlordEnquiryData) =>
      [
        `Name: ${data.fullName}`,
        data.companyName ? `Company: ${data.companyName}` : null,
        `Mobile: ${data.mobile}`,
        `Email: ${data.email}`,
        "",
        `Property type: ${data.propertyTypes.join(", ")}`,
        `Address: ${data.address}`,
        `City: ${withOther(data.cities, data.otherCity).join(", ")}`,
        `Total area: ${data.totalAreaSqFt} sq ft`,
        "",
        `Available from: ${data.availableFrom}`,
        `Expected monthly rent: ${data.expectedRent}`,
        `Occupancy status: ${data.occupancyStatus}`,
        "",
        attachmentsLine([
          [
            `Property Photos (${data.propertyPhotoPaths?.length ?? 0})`,
            Boolean(data.propertyPhotoPaths?.length),
          ],
          ["Floor Plan / Layout", Boolean(data.floorPlanPath)],
        ]),
        "Submitted via the Connectors app.",
      ]
        .filter((l): l is string => l !== null)
        .join("\n"),
    contact: (d) => ({
      name: d.fullName ?? "",
      email: d.email,
      phone: d.mobile,
      companyName: d.companyName,
    }),
  },
  investor: {
    dbSource: "investor",
    schema: investorEnquirySchema,
    contactEmail: site.email.investors,
    subject: (name) => `Investor interest — ${name}`,
    summarize: (data: InvestorEnquiryData) =>
      [
        `Name: ${data.fullName}`,
        `Email: ${data.email}`,
        `Mobile: ${data.mobile}`,
        data.companyOrFund ? `Company/Fund: ${data.companyOrFund}` : null,
        "",
        `Ticket size: ${data.ticketSize}`,
        `Investment type: ${data.investmentTypes.join(", ")}`,
        `Sector interest: ${data.sectorInterest.join(", ")}`,
        "",
        `Preferred city/region: ${withOther(data.cities, data.otherCity).join(", ")}`,
        `Investment horizon: ${data.horizon}`,
        "",
        attachmentsLine([
          ["Investment Profile / Company Overview", Boolean(data.investmentProfilePath)],
        ]),
        "Submitted via the Connectors app.",
      ]
        .filter((l): l is string => l !== null)
        .join("\n"),
    contact: (d) => ({
      name: d.fullName ?? "",
      email: d.email,
      phone: d.mobile,
      companyName: d.companyOrFund,
    }),
  },
};

/**
 * One JSON endpoint for all four enquiry wizards in the app, dispatched by
 * `source` — same zod schemas and the same recordEnquiry() call the website's
 * four Server Actions use, so an app submission lands in the admin queue
 * exactly like a web one. File fields (see EnquiryWizard's FileFieldSpec)
 * send a Storage path from /api/mobile/upload, not a raw file — the schema
 * just validates it's a string/array of strings, same as any other field.
 *
 * Auth is read opportunistically, not required: the current app version
 * always sends a token now that login is mandatory before reaching a form,
 * but this endpoint is reached by whatever APK a given install happens to
 * have — there's no store forcing an update — so an older build submitting
 * with no token at all must keep working exactly as it does today.
 */
export async function POST(request: Request) {
  const session = await verifyMobileSession(request);

  let body: { source?: string } & Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const source = body.source ?? "";
  const config = SOURCES[source];
  if (!config) {
    return NextResponse.json({ ok: false, error: "Unknown enquiry type." }, { status: 400 });
  }

  const parsed = config.schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form and try again." },
      { status: 400 },
    );
  }
  const data = parsed.data;
  const contact = config.contact(data);

  await recordEnquiry({
    source: config.dbSource,
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    companyName: contact.companyName,
    summary: config.summarize(data),
    payload: data,
    submittedByOrganizationId: session?.organizationId ?? null,
  });

  try {
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error } = await resend.emails.send({
        from: process.env.CONTACT_FROM_EMAIL ?? "Connectors App <onboarding@resend.dev>",
        to: config.contactEmail,
        replyTo: contact.email,
        subject: config.subject(contact.name),
        text: config.summarize(data),
      });
      if (error) throw error;
    } else {
      console.log(`[mobile-enquiry:${source}] RESEND_API_KEY not set — logged, not emailed`, data);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`[mobile-enquiry:${source}] failed to send notification email`, err);
    // The DB write above already succeeded — an admin will still see it in
    // the queue even if the notification email failed, so this isn't a hard
    // failure for the app.
    return NextResponse.json({ ok: true });
  }
}
