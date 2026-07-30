"use server";

import { Resend } from "resend";
import { site } from "@/lib/site";
import { recordEnquiry } from "@/lib/actions/record-enquiry";
import {
  landlordEnquirySchema,
  type LandlordEnquiryData,
} from "@/lib/schemas/landlord-enquiry";

export type LandlordEnquiryState = { ok: boolean; error?: string };

const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;

function formatEnquiry(data: LandlordEnquiryData) {
  const cities = [
    ...data.cities.filter((c) => c !== "Other"),
    data.cities.includes("Other") ? data.otherCity : null,
  ].filter(Boolean);

  return [
    `Name: ${data.fullName}`,
    data.companyName ? `Company: ${data.companyName}` : null,
    `Mobile: ${data.mobile}`,
    `Email: ${data.email}`,
    "",
    `Property type: ${data.propertyTypes.join(", ")}`,
    `Address: ${data.address}`,
    `City: ${cities.join(", ")}`,
    `Total area: ${data.totalAreaSqFt} sq ft`,
    "",
    `Available from: ${data.availableFrom}`,
    `Expected monthly rent: ${data.expectedRent}`,
    `Occupancy status: ${data.occupancyStatus}`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

export async function submitLandlordEnquiry(
  _prevState: LandlordEnquiryState | null,
  formData: FormData,
): Promise<LandlordEnquiryState> {
  if (formData.get("company_website")) {
    return { ok: true };
  }

  const raw = {
    fullName: formData.get("fullName"),
    companyName: formData.get("companyName") || undefined,
    mobile: formData.get("mobile"),
    email: formData.get("email"),
    propertyTypes: formData.getAll("propertyTypes").map(String),
    address: formData.get("address"),
    cities: formData.getAll("cities").map(String),
    otherCity: formData.get("otherCity") || undefined,
    totalAreaSqFt: formData.get("totalAreaSqFt"),
    availableFrom: formData.get("availableFrom"),
    expectedRent: formData.get("expectedRent"),
    occupancyStatus: formData.get("occupancyStatus"),
  };

  const parsed = landlordEnquirySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
    };
  }
  const data = parsed.data;

  await recordEnquiry({
    source: "landlord",
    name: data.fullName,
    email: data.email,
    phone: data.mobile,
    companyName: data.companyName,
    summary: formatEnquiry(data),
    payload: data,
  });

  const uploads = [
    ...formData.getAll("propertyPhotos"),
    formData.get("floorPlan"),
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
        to: site.email.landlords,
        replyTo: data.email,
        subject: `Property submission — ${data.fullName}`,
        text: formatEnquiry(data),
        attachments,
      });
      if (error) throw error;
    } else {
      console.log(
        "[landlord-enquiry] RESEND_API_KEY not set — enquiry logged, not emailed:",
        data,
      );
    }
    return { ok: true };
  } catch (err) {
    console.error("[landlord-enquiry] failed to send enquiry", err);
    return {
      ok: false,
      error: `Something went wrong on our end. Email us directly at ${site.email.landlords}.`,
    };
  }
}
