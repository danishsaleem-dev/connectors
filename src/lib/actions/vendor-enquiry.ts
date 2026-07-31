"use server";

import { Resend } from "resend";
import { site } from "@/lib/site";
import { recordEnquiry } from "@/lib/actions/record-enquiry";
import { VENDOR_DISCIPLINE_LABEL } from "@/lib/portal/domain";

export type VendorEnquiryState = {
  ok: boolean;
  error?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * The /become-a-vendor application.
 *
 * Deliberately lands in the same admin enquiries inbox as every other public
 * form rather than creating a vendor organization directly — a public
 * directory listing is something Connectors grants after vetting, so an
 * application is a request to be considered, not a self-serve signup. An
 * admin converts an accepted one into a real vendor org from the portal.
 */
export async function submitVendorEnquiry(
  _prevState: VendorEnquiryState | null,
  formData: FormData,
): Promise<VendorEnquiryState> {
  if (formData.get("company_website")) {
    return { ok: true };
  }

  const companyName = String(formData.get("companyName") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const discipline = String(formData.get("discipline") ?? "").trim();
  const cities = String(formData.get("cities") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const experience = String(formData.get("experience") ?? "").trim();
  const about = String(formData.get("about") ?? "").trim();

  if (companyName.length < 2) return { ok: false, error: "Enter your company name." };
  if (contactName.length < 2) return { ok: false, error: "Enter your name." };
  if (!isValidEmail(email)) return { ok: false, error: "Enter a valid email address." };
  if (!VENDOR_DISCIPLINE_LABEL[discipline]) {
    return { ok: false, error: "Choose the discipline that fits you best." };
  }
  if (about.length < 20) {
    return { ok: false, error: "Tell us a little more about your work — a few sentences." };
  }

  const summary = [
    "Partners Program application.",
    "",
    `Company: ${companyName}`,
    `Discipline: ${VENDOR_DISCIPLINE_LABEL[discipline]}`,
    `Contact: ${contactName}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    website ? `Website: ${website}` : null,
    cities ? `Cities served: ${cities}` : null,
    experience ? `Years experience: ${experience}` : null,
    "",
    "About:",
    about,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  await recordEnquiry({
    source: "vendor",
    name: contactName,
    email,
    phone: phone || undefined,
    companyName,
    summary,
    payload: {
      companyName,
      contactName,
      email,
      phone,
      discipline,
      cities,
      website,
      experience,
      about,
    },
  });

  try {
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error } = await resend.emails.send({
        from: process.env.CONTACT_FROM_EMAIL ?? "Connectors Website <onboarding@resend.dev>",
        to: site.email.general,
        replyTo: email,
        subject: `Partners Program application — ${companyName}`,
        text: summary,
      });
      if (error) throw error;
    } else {
      console.log("[vendor-enquiry] RESEND_API_KEY not set — application logged, not emailed:", {
        companyName,
        email,
      });
    }
    return { ok: true };
  } catch (err) {
    console.error("[vendor-enquiry] failed to send application", err);
    return {
      ok: false,
      error: `Something went wrong on our end. Email us directly at ${site.email.general}.`,
    };
  }
}
