"use server";

import { Resend } from "resend";
import { site } from "@/lib/site";

export type QuickContactState = {
  ok: boolean;
  error?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * The homepage "Let's talk" quick-contact form. Deliberately minimal — name,
 * email, message — unlike the longer per-audience enquiry forms.
 *
 * Email delivery is stubbed until RESEND_API_KEY is set: without it, a valid
 * submission is accepted and logged server-side rather than lost, but no
 * email goes out. See .env.example.
 */
export async function submitQuickContact(
  _prevState: QuickContactState | null,
  formData: FormData,
): Promise<QuickContactState> {
  // Honeypot — a bot fills every field it can see in the DOM; a real visitor
  // never touches this one. Silently "succeed" rather than telling the bot
  // its submission was rejected.
  if (formData.get("company_website")) {
    return { ok: true };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  /** Optional context set by the page embedding the form — e.g. which vendor
   * service the visitor is asking about. Purely for the notification's
   * subject line, so a reply doesn't have to guess what it's about. */
  const subject = String(formData.get("subject") ?? "").trim();

  if (name.length < 2) {
    return { ok: false, error: "Enter your name." };
  }
  if (!isValidEmail(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (message.length < 10) {
    return {
      ok: false,
      error: "Tell us a little more — a couple of sentences is plenty.",
    };
  }

  try {
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error } = await resend.emails.send({
        from: process.env.CONTACT_FROM_EMAIL ?? "Connectors Website <onboarding@resend.dev>",
        to: site.email.general,
        replyTo: email,
        subject: subject ? `${subject} — enquiry from ${name}` : `New enquiry from ${name}`,
        text: `${name} <${email}> wrote:\n\n${message}${subject ? `\n\n---\nAbout: ${subject}` : ""}`,
      });
      if (error) throw error;
    } else {
      console.log("[contact] RESEND_API_KEY not set — enquiry logged, not emailed:", {
        name,
        email,
        message,
        subject,
      });
    }
    return { ok: true };
  } catch (err) {
    console.error("[contact] failed to send enquiry", err);
    return {
      ok: false,
      error: `Something went wrong on our end. Email us directly at ${site.email.general}.`,
    };
  }
}
