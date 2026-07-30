import { getDb } from "@/lib/db/client";
import { enquiries, type EnquirySource } from "@/lib/db/schema";

/**
 * Lands a public form submission in the admin review queue. Deliberately
 * non-fatal: the marketing site has to keep working even before a
 * DATABASE_URL is configured, so a failure here is logged and swallowed
 * rather than failing the visitor's submission — email delivery (or its own
 * console-log fallback) is the path that still has to succeed.
 */
export async function recordEnquiry(entry: {
  source: EnquirySource;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  summary: string;
  payload: Record<string, unknown>;
}) {
  try {
    await getDb().insert(enquiries).values(entry);
  } catch (err) {
    console.error(`[enquiries] failed to record ${entry.source} enquiry`, err);
  }
}
