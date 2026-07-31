import type { Metadata } from "next";
import { AudienceAppPromo } from "@/components/audience/AudienceAppPromo";
import { AudienceDivisions } from "@/components/audience/AudienceDivisions";
import { AudienceFaq } from "@/components/audience/AudienceFaq";
import { AudienceGallery } from "@/components/audience/AudienceGallery";
import { AudienceHero } from "@/components/audience/AudienceHero";
import { LandlordEnquiryForm } from "@/components/forms/LandlordEnquiryForm";
import { VendorCta } from "@/components/VendorCta";
import { IndustriesMarquee } from "@/components/IndustriesMarquee";
import { Reveal } from "@/components/Reveal";
import { Eyebrow, Section } from "@/components/ui";
import { faqs } from "@/lib/content/faq";
import { photos } from "@/lib/images";
import { audiences } from "@/lib/site";

const audience = audiences.find((a) => a.slug === "for-landlords")!;

export const metadata: Metadata = {
  title: "For Landlords & Developers",
  description:
    "Submit a vacant retail, mall or commercial space and we'll match it against brands actively looking to expand.",
};

export default function ForLandlordsPage() {
  return (
    <>
      <AudienceHero
        eyebrow="For Landlords & Developers"
        title={audience.lead}
        photo={photos.towers}
        jumpLabel="Submit your property"
      />

      <AudienceDivisions
        audience="for-landlords"
        title="Matched to brands actively looking to expand."
      />

      <AudienceGallery
        eyebrow="Space, filled properly"
        title="Vacant units matched to brands that stay."
        body="Malls, retail parks, commercial towers and mixed-use developments — assessed on the same criteria we use to place a brand into them."
        items={[
          { photo: photos.mall, caption: "Malls and retail parks, audited unit by unit." },
          { photo: photos.office, caption: "Commercial and mixed-use space, considered." },
          { photo: photos.datacentre, caption: "Technical and industrial space, specified precisely." },
        ]}
      />

      <IndustriesMarquee />

      <AudienceAppPromo audience="for-landlords" />

      <VendorCta />

      <AudienceFaq items={faqs} />

      <Section id="request-form" tone="sunken">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <Eyebrow>Property submission</Eyebrow>
          </Reveal>
          <Reveal i={1}>
            <h2 className="font-display display-lg mt-4 text-balance">
              Tell us what space you have, and we'll find who fills it.
            </h2>
          </Reveal>
          <Reveal i={2}>
            <p className="mt-5 leading-relaxed text-[var(--muted)] text-pretty">
              Vacant space costs money every month it sits empty. Every field
              marked <span className="text-violet-400">*</span> is required —
              the rest is optional.
            </p>
          </Reveal>

          <Reveal i={3} className="mt-10">
            <LandlordEnquiryForm />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
