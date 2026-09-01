import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { Eyebrow, Section } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Connectors collects, uses and protects your data across the website and app.",
  alternates: { canonical: "/privacy" },
};

const LAST_UPDATED = "29 August 2026";

export default function PrivacyPage() {
  return (
    <Section className="pt-32 pb-24 md:pt-40">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <Eyebrow>Legal</Eyebrow>
        </Reveal>
        <Reveal i={1}>
          <h1 className="font-display display-lg mt-5 text-balance">Privacy Policy</h1>
        </Reveal>
        <Reveal i={2}>
          <p className="mt-4 text-sm text-[var(--muted)]">Last updated {LAST_UPDATED}</p>
        </Reveal>

        <Reveal i={3}>
          <div className="rich-text mt-10 text-[15px] leading-relaxed text-[var(--muted)]">
            <p>
              This policy covers the Connectors website (connectors.group), the Connectors
              portal, and the Connectors mobile app (together, the &ldquo;Service&rdquo;). It
              explains what we collect, why, and what you can do about it.
            </p>

            <h2>Who we are</h2>
            <p>
              Connectors is a business expansion, franchise development, retail leasing and
              investment facilitation company, connecting brands, franchisees, investors,
              landlords and developers. Contact details for each of our offices are on our{" "}
              <a href="/contact">Contact</a> page. For anything privacy-related, email{" "}
              <a href={`mailto:${site.email.general}`}>{site.email.general}</a>.
            </p>

            <h2>What we collect</h2>
            <p>We only collect what the Service actually needs to run:</p>
            <ul>
              <li>
                <strong>Account details</strong>{" "}— your name, email, password (stored as a
                one-way hash, never in plain text), and your organization&rsquo;s name, phone
                number and country.
              </li>
              <li>
                <strong>Profile details</strong>{" "}— information specific to your account type:
                for example a brand&rsquo;s industry and franchise terms, a franchisee&rsquo;s
                budget and preferred cities, or a landlord&rsquo;s property listings (including
                any photos you upload for a listing).
              </li>
              <li>
                <strong>Messages and enquiries</strong>{" "}— anything you send us through the
                portal&rsquo;s messages, an enquiry form, a request, or the Connectors AI chat
                widget, including your contact details if you submit them through a public
                form or the chat widget without an account.
              </li>
              <li>
                <strong>Usage details you create directly</strong>{" "}— the properties you save as
                a brand, and the basic activity needed to keep your session signed in.
              </li>
            </ul>
            <p>
              We do <strong>not</strong>{" "}access your device&rsquo;s camera, microphone,
              contacts, or precise location, and the app does not use advertising trackers or
              third-party analytics SDKs.
            </p>

            <h2>How we use it</h2>
            <ul>
              <li>To run your account and show you the parts of the Service relevant to you.</li>
              <li>
                To let our team follow up on enquiries, messages and requests — see
                &ldquo;How introductions work&rdquo; below.
              </li>
              <li>To send account-related emails, such as a password reset.</li>
              <li>To keep the Service secure and working as intended.</li>
            </ul>
            <p>We do not sell your personal data, to anyone, ever.</p>

            <h2>How introductions work</h2>
            <p>
              No participant in the portal can see another participant&rsquo;s contact details
              or a property&rsquo;s exact address directly. A brand browsing available
              locations sees what it needs to judge whether a space fits — city, area, size,
              photos — never who owns it. Every introduction, enquiry and follow-up goes
              through our team first. This is a deliberate design choice, not a gap: it&rsquo;s
              how we keep the platform a place people trust with real business information.
            </p>

            <h2>Who we share it with</h2>
            <p>
              We don&rsquo;t share your personal data with other Connectors participants
              beyond what &ldquo;How introductions work&rdquo; describes. We do use a small
              number of service providers to run the Service, who process data on our behalf
              under their own security commitments:
            </p>
            <ul>
              <li>Our database and file storage providers, to store your account, listing and message data securely.</li>
              <li>Our email provider, to deliver account emails like password resets.</li>
            </ul>
            <p>
              We may also disclose information where required by law, or to protect the
              rights, property or safety of Connectors, our users, or the public.
            </p>

            <h2>Where your data lives</h2>
            <p>
              Property photos and documents are stored in a private file store with no public
              access — every image the Service shows you is served through a short-lived,
              signed link generated on request, not a permanent public URL. Session tokens are
              stored in your device&rsquo;s secure keychain (app) or as a signed, HTTP-only
              cookie (website), not in plain readable storage.
            </p>

            <h2>Your choices</h2>
            <ul>
              <li>You can review and update most of your account and profile details directly in the portal or the app.</li>
              <li>
                You can ask us to delete your account and associated data at any time by
                emailing <a href={`mailto:${site.email.general}`}>{site.email.general}</a>. We
                may retain limited records where we&rsquo;re legally required to.
              </li>
              <li>
                If you&rsquo;re in the UK or EU, you have rights under GDPR to access, correct,
                or erase your data, and to object to or restrict certain processing — the same
                email gets you there.
              </li>
            </ul>

            <h2>Children</h2>
            <p>
              The Service is a business platform, not directed at children, and we do not
              knowingly collect personal data from anyone under 16.
            </p>

            <h2>Changes to this policy</h2>
            <p>
              We&rsquo;ll update the date at the top of this page whenever this policy
              changes. If a change is significant, we&rsquo;ll look for a reasonable way to let
              account holders know.
            </p>

            <h2>Contact</h2>
            <p>
              Questions about this policy or your data — email{" "}
              <a href={`mailto:${site.email.general}`}>{site.email.general}</a>.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
