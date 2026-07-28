"use server";

import { Resend } from "resend";
import { site } from "@/lib/site";
import { brandEnquirySchema, type BrandEnquiryData } from "@/lib/schemas/brand-enquiry";

export type BrandEnquiryState = {
  ok: boolean;
  error?: string;
};

// A sane ceiling for email attachments — well under most providers' hard caps.
const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;

function formatEnquiry(data: BrandEnquiryData) {
  const cities = [
    ...data.cities.filter((c) => c !== "Other"),
    data.cities.includes("Other") ? data.otherCity : null,
  ].filter(Boolean);
  const outletTypes = [
    ...data.outletTypes.filter((t) => t !== "Other"),
    data.outletTypes.includes("Other") ? data.otherOutletType : null,
  ].filter(Boolean);

  return [
    `Brand: ${data.brandName}`,
    `Company: ${data.companyName}`,
    `Contact: ${data.contactName}${data.designation ? ` (${data.designation})` : ""}`,
    `Mobile: ${data.mobile}`,
    `Email: ${data.email}`,
    data.website ? `Website/Social: ${data.website}` : null,
    "",
    `Required cities: ${cities.join(", ")}`,
    `Preferred areas: ${data.preferredAreas}`,
    "",
    `Outlet type: ${outletTypes.join(", ")}`,
    `Required area: ${data.areaMin} - ${data.areaMax} sq ft`,
    `Preferred location type: ${data.locationTypes.join(", ")}`,
    "",
    `Monthly rental budget: ${data.rentalBudget}`,
    data.additionalServices?.length
      ? `Additional services: ${data.additionalServices.join(", ")}`
      : null,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

/**
 * The /for-brands "Brand Expansion Request Form" — the full, detailed intake
 * form, distinct from the homepage's minimal quick-contact form.
 *
 * File uploads (company profile, brand logo, outlet photos) are optional and,
 * if present, attached directly to the notification email — there's no
 * document storage backend yet (that's Phase 3/Postgres+Blob work), so this
 * is the honest interim path rather than silently dropping them. Combined
 * attachment size is capped at 8MB; see .env.example for RESEND_API_KEY.
 */
export async function submitBrandEnquiry(
  _prevState: BrandEnquiryState | null,
  formData: FormData,
): Promise<BrandEnquiryState> {
  if (formData.get("company_website")) {
    return { ok: true };
  }

  const raw = {
    brandName: formData.get("brandName"),
    companyName: formData.get("companyName"),
    contactName: formData.get("contactName"),
    designation: formData.get("designation") || undefined,
    mobile: formData.get("mobile"),
    email: formData.get("email"),
    website: formData.get("website") || undefined,
    cities: formData.getAll("cities").map(String),
    otherCity: formData.get("otherCity") || undefined,
    preferredAreas: formData.get("preferredAreas"),
    outletTypes: formData.getAll("outletTypes").map(String),
    otherOutletType: formData.get("otherOutletType") || undefined,
    areaMin: formData.get("areaMin"),
    areaMax: formData.get("areaMax"),
    locationTypes: formData.getAll("locationTypes").map(String),
    rentalBudget: formData.get("rentalBudget"),
    additionalServices: formData.getAll("additionalServices").map(String),
  };

  const parsed = brandEnquirySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
    };
  }
  const data = parsed.data;

  const uploads = [
    formData.get("companyProfile"),
    formData.get("brandLogo"),
    ...formData.getAll("outletPhotos"),
  ].filter((f): f is File => f instanceof File && f.size > 0);

  const totalBytes = uploads.reduce((sum, f) => sum + f.size, 0);
  if (totalBytes > MAX_ATTACHMENT_BYTES) {
    return {
      ok: false,
      error: "Attachments are too large — please keep the combined size under 8MB.",
    };
  }

  try {
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const attachments = await Promise.all(
        uploads.map(async (file) => ({
          filename: file.name,
          content: Buffer.from(await file.arrayBuffer()),
        })),
      );
      const { error } = await resend.emails.send({
        from: process.env.CONTACT_FROM_EMAIL ?? "Connectors Website <onboarding@resend.dev>",
        to: site.email.brands,
        replyTo: data.email,
        subject: `Brand expansion request — ${data.brandName}`,
        text: formatEnquiry(data),
        attachments,
      });
      if (error) throw error;
    } else {
      console.log(
        "[brand-enquiry] RESEND_API_KEY not set — enquiry logged, not emailed:",
        data,
        `${uploads.length} file(s) attached`,
      );
    }
    return { ok: true };
  } catch (err) {
    console.error("[brand-enquiry] failed to send enquiry", err);
    return {
      ok: false,
      error: `Something went wrong on our end. Email us directly at ${site.email.brands}.`,
    };
  }
}
