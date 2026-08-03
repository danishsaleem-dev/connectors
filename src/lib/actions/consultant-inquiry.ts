"use server";

import { Resend } from "resend";
import { getDb } from "@/lib/db/client";
import { consultantInquiries } from "@/lib/db/schema";
import { site } from "@/lib/site";

export type ConsultantInquiryState = {
  ok: boolean;
  error?: string;
};

/**
 * Submitted from the inquiry form inside a consultant's modal on the public
 * /consultants page. Short enough (name, email, message) that a zod schema
 * would be more ceremony than the three fields warrant — hand-validated,
 * same as the site's other short forms.
 */
export async function submitConsultantInquiry(
  _prevState: ConsultantInquiryState | null,
  formData: FormData,
): Promise<ConsultantInquiryState> {
  if (formData.get("company_website")) {
    return { ok: true };
  }

  const consultantId = String(formData.get("consultantId") ?? "").trim() || null;
  const consultantName = String(formData.get("consultantName") ?? "").trim() || "a consultant";
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    return { ok: false, error: "Fill in your name, email and message." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  try {
    await getDb().insert(consultantInquiries).values({ consultantId, name, email, message });
  } catch (err) {
    console.error("[consultant-inquiry] failed to record inquiry", err);
    return { ok: false, error: "Something went wrong on our end. Please try again shortly." };
  }

  try {
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error } = await resend.emails.send({
        from: process.env.CONTACT_FROM_EMAIL ?? "Connectors Website <onboarding@resend.dev>",
        to: site.email.general,
        replyTo: email,
        subject: `Consultant inquiry — ${consultantName}`,
        text: `Consultant: ${consultantName}\nFrom: ${name} <${email}>\n\n${message}`,
      });
      if (error) throw error;
    } else {
      console.log("[consultant-inquiry] RESEND_API_KEY not set — inquiry logged, not emailed:", {
        consultantName,
        name,
        email,
      });
    }
  } catch (err) {
    // The inquiry is already saved and visible in the admin queue — a failed
    // notification email isn't a reason to tell the visitor it didn't work.
    console.error("[consultant-inquiry] failed to send notification email", err);
  }

  return { ok: true };
}
