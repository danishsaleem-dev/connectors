import type { Metadata } from "next";
import { AudienceAppPromo } from "@/components/audience/AudienceAppPromo";
import { AudienceDivisions } from "@/components/audience/AudienceDivisions";
import { AudienceFaq } from "@/components/audience/AudienceFaq";
import { AudienceGallery } from "@/components/audience/AudienceGallery";
import { AudienceHero } from "@/components/audience/AudienceHero";
import { BrandEnquiryForm } from "@/components/forms/BrandEnquiryForm";
import { GatedForm } from "@/components/GatedForm";
import { VendorCta } from "@/components/VendorCta";
import { IndustriesMarquee } from "@/components/IndustriesMarquee";
import { Reveal } from "@/components/Reveal";
import { Eyebrow, Section } from "@/components/ui";
import { faqs } from "@/lib/content/faq";
import { photos } from "@/lib/images";
import { audiences } from "@/lib/site";

const audience = audiences.find((a) => a.slug === "for-brands")!;

export const metadata: Metadata = {
  title: "For Brands",
  description:
    "Location sourcing, franchise development, investor connections and marketing — everything a brand needs to expand, in one request.",
};

export default function ForBrandsPage() {
  return (
    <>
      <AudienceHero
        eyebrow="For Brands"
        title={audience.lead}
        photo={photos.boutique}
        jumpLabel="Start your expansion request"
      />

      <AudienceDivisions
        audience="for-brands"
        title="Five divisions, one expansion request."
      />

      <AudienceGallery
        eyebrow="Where brands expand"
        title="Real spaces, real openings."
        body="Not renderings — the kind of retail floor, mall unit and high street corner an expansion actually has to work inside."
        items={[
          { photo: photos.mall, caption: "Prime retail footfall, mapped city by city." },
          { photo: photos.checkout, caption: "From signed lease to opening day." },
          { photo: photos.cafe, caption: "Every format, from flagship to kiosk." },
        ]}
      />

      <IndustriesMarquee />

      <AudienceAppPromo audience="for-brands" />

      <VendorCta />

      <AudienceFaq items={faqs} />

      <Section id="request-form" tone="sunken">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <Eyebrow>Brand expansion request</Eyebrow>
          </Reveal>
          <Reveal i={1}>
            <h2 className="font-display display-lg mt-4 text-balance">
              Tell us what you're looking to open, and where.
            </h2>
          </Reveal>
          <Reveal i={2}>
            <p className="mt-5 leading-relaxed text-[var(--muted)] text-pretty">
              The more detail you give us here, the faster we can match real
              locations and franchise candidates against it. Every field marked{" "}
              <span className="text-violet-400">*</span> is required — the
              rest is optional.
            </p>
          </Reveal>

          <Reveal i={3} className="mt-10">
            <GatedForm>
              <BrandEnquiryForm />
            </GatedForm>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
