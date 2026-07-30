"use server";

import { Resend } from "resend";
import { site } from "@/lib/site";
import { recordEnquiry } from "@/lib/actions/record-enquiry";
import {
  franchiseEnquirySchema,
  type FranchiseEnquiryData,
} from "@/lib/schemas/franchise-enquiry";

export type FranchiseEnquiryState = { ok: boolean; error?: string };

const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;

function formatEnquiry(data: FranchiseEnquiryData) {
  const cities = [
    ...data.cities.filter((c) => c !== "Other"),
    data.cities.includes("Other") ? data.otherCity : null,
  ].filter(Boolean);

  return [
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
    `Preferred territory: ${cities.join(", ")}`,
    `Operational plan: ${data.operationalCapability}`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

export async function submitFranchiseEnquiry(
  _prevState: FranchiseEnquiryState | null,
  formData: FormData,
): Promise<FranchiseEnquiryState> {
  if (formData.get("company_website")) {
    return { ok: true };
  }

  const raw = {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    mobile: formData.get("mobile"),
    cityOfResidence: formData.get("cityOfResidence"),
    investmentCapacity: formData.get("investmentCapacity"),
    businessExperience: formData.get("businessExperience"),
    currentBusiness: formData.get("currentBusiness") || undefined,
    industryInterest: formData.getAll("industryInterest").map(String),
    cities: formData.getAll("cities").map(String),
    otherCity: formData.get("otherCity") || undefined,
    operationalCapability: formData.get("operationalCapability"),
  };

  const parsed = franchiseEnquirySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
    };
  }
  const data = parsed.data;

  await recordEnquiry({
    source: "franchisee",
    name: data.fullName,
    email: data.email,
    phone: data.mobile,
    summary: formatEnquiry(data),
    payload: data,
  });

  const uploads = [formData.get("supportingDocument")].filter(
    (f): f is File => f instanceof File && f.size > 0,
  );
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
        to: site.email.franchise,
        replyTo: data.email,
        subject: `Franchise application — ${data.fullName}`,
        text: formatEnquiry(data),
        attachments,
      });
      if (error) throw error;
    } else {
      console.log(
        "[franchise-enquiry] RESEND_API_KEY not set — enquiry logged, not emailed:",
        data,
      );
    }
    return { ok: true };
  } catch (err) {
    console.error("[franchise-enquiry] failed to send enquiry", err);
    return {
      ok: false,
      error: `Something went wrong on our end. Email us directly at ${site.email.franchise}.`,
    };
  }
}
