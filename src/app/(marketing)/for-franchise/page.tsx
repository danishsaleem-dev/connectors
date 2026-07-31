import type { Metadata } from "next";
import { AudienceAppPromo } from "@/components/audience/AudienceAppPromo";
import { AudienceDivisions } from "@/components/audience/AudienceDivisions";
import { AudienceFaq } from "@/components/audience/AudienceFaq";
import { AudienceGallery } from "@/components/audience/AudienceGallery";
import { AudienceHero } from "@/components/audience/AudienceHero";
import { FranchiseEnquiryForm } from "@/components/forms/FranchiseEnquiryForm";
import { VendorCta } from "@/components/VendorCta";
import { IndustriesMarquee } from "@/components/IndustriesMarquee";
import { Reveal } from "@/components/Reveal";
import { Eyebrow, Section } from "@/components/ui";
import { faqs } from "@/lib/content/faq";
import { photos } from "@/lib/images";
import { audiences } from "@/lib/site";

const audience = audiences.find((a) => a.slug === "for-franchise")!;

export const metadata: Metadata = {
  title: "For Franchisees",
  description:
    "Find a franchise matched to your budget, territory and experience — with the training, systems and support to run it.",
};

export default function ForFranchisePage() {
  return (
    <>
      <AudienceHero
        eyebrow="For Franchisees"
        title={audience.lead}
        photo={photos.restaurant}
        jumpLabel="Start your application"
      />

      <AudienceDivisions
        audience="for-franchise"
        title="Matched to your budget, territory and experience."
      />

      <AudienceGallery
        eyebrow="What you're stepping into"
        title="Systems built to be run, not guessed at."
        body="Formats that already work, with training and territory decided before you sign anything."
        items={[
          { photo: photos.fitness, caption: "Operating models proven across formats." },
          { photo: photos.planning, caption: "Territory and budget mapped before you commit." },
          { photo: photos.checkout, caption: "Day-one training, not day-one guesswork." },
        ]}
      />

      <IndustriesMarquee />

      <AudienceAppPromo audience="for-franchise" />

      <VendorCta />

      <AudienceFaq items={faqs} />

      <Section id="request-form" tone="sunken">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <Eyebrow>Franchisee application</Eyebrow>
          </Reveal>
          <Reveal i={1}>
            <h2 className="font-display display-lg mt-4 text-balance">
              Tell us what you're looking to run, and where.
            </h2>
          </Reveal>
          <Reveal i={2}>
            <p className="mt-5 leading-relaxed text-[var(--muted)] text-pretty">
              We match on investment capacity, experience, territory and
              industry interest — not just whoever applies first. Every field
              marked <span className="text-violet-400">*</span> is required —
              the rest is optional.
            </p>
          </Reveal>

          <Reveal i={3} className="mt-10">
            <FranchiseEnquiryForm />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
