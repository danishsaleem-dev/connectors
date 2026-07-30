"use server";

import { Resend } from "resend";
import { site } from "@/lib/site";
import { recordEnquiry } from "@/lib/actions/record-enquiry";
import {
  investorEnquirySchema,
  type InvestorEnquiryData,
} from "@/lib/schemas/investor-enquiry";

export type InvestorEnquiryState = { ok: boolean; error?: string };

const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;

function formatEnquiry(data: InvestorEnquiryData) {
  const cities = [
    ...data.cities.filter((c) => c !== "Other"),
    data.cities.includes("Other") ? data.otherCity : null,
  ].filter(Boolean);

  return [
    `Name: ${data.fullName}`,
    `Email: ${data.email}`,
    `Mobile: ${data.mobile}`,
    data.companyOrFund ? `Company/Fund: ${data.companyOrFund}` : null,
    "",
    `Ticket size: ${data.ticketSize}`,
    `Investment type: ${data.investmentTypes.join(", ")}`,
    `Sector interest: ${data.sectorInterest.join(", ")}`,
    "",
    `Preferred city/region: ${cities.join(", ")}`,
    `Investment horizon: ${data.horizon}`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

export async function submitInvestorEnquiry(
  _prevState: InvestorEnquiryState | null,
  formData: FormData,
): Promise<InvestorEnquiryState> {
  if (formData.get("company_website")) {
    return { ok: true };
  }

  const raw = {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    mobile: formData.get("mobile"),
    companyOrFund: formData.get("companyOrFund") || undefined,
    ticketSize: formData.get("ticketSize"),
    investmentTypes: formData.getAll("investmentTypes").map(String),
    sectorInterest: formData.getAll("sectorInterest").map(String),
    cities: formData.getAll("cities").map(String),
    otherCity: formData.get("otherCity") || undefined,
    horizon: formData.get("horizon"),
  };

  const parsed = investorEnquirySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
    };
  }
  const data = parsed.data;

  await recordEnquiry({
    source: "investor",
    name: data.fullName,
    email: data.email,
    phone: data.mobile,
    companyName: data.companyOrFund,
    summary: formatEnquiry(data),
    payload: data,
  });

  const uploads = [formData.get("investmentProfile")].filter(
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
        to: site.email.investors,
        replyTo: data.email,
        subject: `Investor interest — ${data.fullName}`,
        text: formatEnquiry(data),
        attachments,
      });
      if (error) throw error;
    } else {
      console.log(
        "[investor-enquiry] RESEND_API_KEY not set — enquiry logged, not emailed:",
        data,
      );
    }
    return { ok: true };
  } catch (err) {
    console.error("[investor-enquiry] failed to send enquiry", err);
    return {
      ok: false,
      error: `Something went wrong on our end. Email us directly at ${site.email.investors}.`,
    };
  }
}
