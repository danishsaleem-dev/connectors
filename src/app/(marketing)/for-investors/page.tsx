import type { Metadata } from "next";
import { AudienceAppPromo } from "@/components/audience/AudienceAppPromo";
import { AudienceDivisions } from "@/components/audience/AudienceDivisions";
import { AudienceFaq } from "@/components/audience/AudienceFaq";
import { AudienceGallery } from "@/components/audience/AudienceGallery";
import { AudienceHero } from "@/components/audience/AudienceHero";
import { InvestorEnquiryForm } from "@/components/forms/InvestorEnquiryForm";
import { GatedForm } from "@/components/GatedForm";
import { VendorCta } from "@/components/VendorCta";
import { IndustriesMarquee } from "@/components/IndustriesMarquee";
import { Reveal } from "@/components/Reveal";
import { Eyebrow, Section } from "@/components/ui";
import { faqs } from "@/lib/content/faq";
import { photos } from "@/lib/images";
import { audiences } from "@/lib/site";

const audience = audiences.find((a) => a.slug === "for-investors")!;

export const metadata: Metadata = {
  title: "For Investors",
  description:
    "Access proven business models, expansion-ready brands and multi-unit franchise opportunities matched to your investment profile.",
};

export default function ForInvestorsPage() {
  return (
    <>
      <AudienceHero
        eyebrow="For Investors"
        title={audience.lead}
        photo={photos.boardroom}
        jumpLabel="Share your investment profile"
      />

      <AudienceDivisions
        audience="for-investors"
        title="Verified opportunities, not cold introductions."
      />

      <AudienceGallery
        eyebrow="Where capital meets diligence"
        title="Opportunities, verified before they're introduced."
        body="Every introduction is backed by the same performance data, structuring and paperwork we'd want to see if we were writing the cheque."
        items={[
          { photo: photos.analytics, caption: "Performance data behind every opportunity." },
          { photo: photos.signing, caption: "Structured agreements, reviewed before you're introduced." },
          { photo: photos.planning, caption: "Ticket size and sector matched to your profile." },
        ]}
      />

      <IndustriesMarquee />

      <AudienceAppPromo audience="for-investors" />

      <VendorCta />

      <AudienceFaq items={faqs} />

      <Section id="request-form" tone="sunken">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <Eyebrow>Investment interest</Eyebrow>
          </Reveal>
          <Reveal i={1}>
            <h2 className="font-display display-lg mt-4 text-balance">
              Tell us your profile, and we'll bring the right opportunities.
            </h2>
          </Reveal>
          <Reveal i={2}>
            <p className="mt-5 leading-relaxed text-[var(--muted)] text-pretty">
              We match against ticket size, sector interest and horizon before
              we ever introduce a name. Every field marked{" "}
              <span className="text-violet-400">*</span> is required — the
              rest is optional.
            </p>
          </Reveal>

          <Reveal i={3} className="mt-10">
            <GatedForm>
              <InvestorEnquiryForm />
            </GatedForm>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
