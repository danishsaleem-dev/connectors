import { getCurrentUser } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db/client";
import { enquiries, type EnquirySource } from "@/lib/db/schema";

/**
 * Lands a public form submission in the admin review queue. Deliberately
 * non-fatal: the marketing site has to keep working even before a
 * DATABASE_URL is configured, so a failure here is logged and swallowed
 * rather than failing the visitor's submission — email delivery (or its own
 * console-log fallback) is the path that still has to succeed.
 *
 * If the visitor was signed into a portal account when they submitted,
 * that account's organization is attached automatically — every one of the
 * four audience forms goes through this one function, so this is the only
 * place that needs to know about the session.
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
    const user = await getCurrentUser();
    await getDb()
      .insert(enquiries)
      .values({ ...entry, submittedByOrganizationId: user?.organizationId ?? null });
  } catch (err) {
    console.error(`[enquiries] failed to record ${entry.source} enquiry`, err);
  }
}
