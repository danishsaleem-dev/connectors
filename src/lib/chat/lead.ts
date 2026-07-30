"use server";

import { Resend } from "resend";
import { site } from "@/lib/site";
import { getDb } from "@/lib/db/client";
import { enquiries, enquirySourceEnum, type ChatTranscript, type EnquirySource } from "@/lib/db/schema";

/**
 * Lead capture from the site assistant.
 *
 * The widget itself never calls the network — this is the one and only server
 * round-trip it makes, and only when a visitor deliberately hands over their
 * details. Everything they typed before that stays in their browser.
 *
 * A captured lead is stored as an ordinary enquiry so it lands in the same
 * admin inbox as the public forms and inherits the whole existing workflow
 * (review, convert to an organization, archive). The transcript rides along so
 * an admin can read what was actually asked before replying.
 */

export type ChatLeadState = {
  ok: boolean;
  error?: string;
};

/** Belt and braces against a hand-crafted POST: the transcript is client-supplied,
 * so cap how much of it we're willing to store. */
const MAX_MESSAGES = 40;
const MAX_MESSAGE_CHARS = 600;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const SOURCE_LABEL: Record<EnquirySource, string> = {
  brand: "A brand looking to expand",
  franchisee: "Someone looking to buy a franchise",
  landlord: "A landlord or property owner",
  investor: "An investor",
};

function parseTranscript(raw: FormDataEntryValue | null): ChatTranscript {
  if (typeof raw !== "string" || !raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (m): m is { role: string; text: string } =>
          !!m && typeof m === "object" && typeof (m as { text?: unknown }).text === "string",
      )
      .slice(-MAX_MESSAGES)
      .map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        text: m.text.slice(0, MAX_MESSAGE_CHARS),
      }));
  } catch {
    // A malformed transcript must never cost us the lead — the contact details
    // are the part that matters.
    return [];
  }
}

export async function submitChatLead(
  _prevState: ChatLeadState | null,
  formData: FormData,
): Promise<ChatLeadState> {
  if (formData.get("company_website")) {
    return { ok: true };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const rawSource = String(formData.get("source") ?? "");

  if (name.length < 2) return { ok: false, error: "Enter your name." };
  if (!isValidEmail(email)) return { ok: false, error: "Enter a valid email address." };

  const source = (enquirySourceEnum.enumValues as readonly string[]).includes(rawSource)
    ? (rawSource as EnquirySource)
    : null;
  if (!source) return { ok: false, error: "Tell us which of these describes you." };

  const transcript = parseTranscript(formData.get("transcript"));

  const summary = [
    `Captured by the website assistant.`,
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    `Described themselves as: ${SOURCE_LABEL[source]}`,
    note ? `\nWhat they're after:\n${note}` : null,
    transcript.length ? `\n${transcript.length} messages exchanged — see the transcript.` : null,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  // Unlike the public forms, this write is NOT swallowed on failure. A form
  // submission still reaches us by email if the database is down; a chat lead
  // has no other path, so the visitor has to be told it didn't save.
  try {
    await getDb()
      .insert(enquiries)
      .values({
        source,
        name,
        email,
        phone: phone || null,
        summary,
        payload: { channel: "chat", note: note || null, questionsAsked: transcript.filter((m) => m.role === "user").length },
        transcript,
      });
  } catch (err) {
    console.error("[chat-lead] failed to record lead", err);
    return {
      ok: false,
      error: `We couldn't save that. Please email us at ${site.email.general}.`,
    };
  }

  // Notification is best-effort: the lead is already safely in the inbox, so a
  // mail failure must not tell the visitor their details were lost.
  try {
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.CONTACT_FROM_EMAIL ?? "Connectors Website <onboarding@resend.dev>",
        to: site.email.general,
        replyTo: email,
        subject: `Chat lead — ${name}`,
        text: `${summary}\n\n---\n\n${transcript.map((m) => `${m.role === "user" ? "Visitor" : "Assistant"}: ${m.text}`).join("\n\n")}`,
      });
    } else {
      console.log("[chat-lead] RESEND_API_KEY not set — lead saved, not emailed:", { name, email });
    }
  } catch (err) {
    console.error("[chat-lead] lead saved but notification failed", err);
  }

  return { ok: true };
}
