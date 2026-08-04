import type { Metadata } from "next";
import { AudienceAppPromo } from "@/components/audience/AudienceAppPromo";
import { AudienceDivisions } from "@/components/audience/AudienceDivisions";
import { AudienceGallery } from "@/components/audience/AudienceGallery";
import { AudienceHero } from "@/components/audience/AudienceHero";
import { FaqVideoSection } from "@/components/FaqVideoSection";
import { FranchiseEnquiryForm } from "@/components/forms/FranchiseEnquiryForm";
import { GatedForm } from "@/components/GatedForm";
import { FranchisingBrandsSection } from "@/components/FranchisingBrandsSection";
import { TestimonialSection } from "@/components/TestimonialSection";
import { VendorCta } from "@/components/VendorCta";
import { IndustriesMarquee } from "@/components/IndustriesMarquee";
import { Reveal } from "@/components/Reveal";
import { Eyebrow, Section } from "@/components/ui";
import { franchiseFaqs, franchiseTestimonials, franchiseVideoUrl } from "@/lib/content/franchise";
import { photos } from "@/lib/images";
import { audiences } from "@/lib/site";

const audience = audiences.find((a) => a.slug === "for-franchise")!;

export const metadata: Metadata = {
  title: "For Franchisees",
  description:
    "Find a franchise matched to your budget, territory and experience — with the training, systems and support to run it.",
};

export default async function ForFranchisePage({
  searchParams,
}: {
  searchParams: Promise<{ industry?: string }>;
}) {
  const { industry } = await searchParams;

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

      <FranchisingBrandsSection industry={industry} />

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

      <TestimonialSection
        heading="Successful stories"
        items={franchiseTestimonials}
      />

      <VendorCta />

      <FaqVideoSection
        heading="Before you apply."
        videoUrl={franchiseVideoUrl}
        videoTitle="How franchising through Connectors works"
        faqs={franchiseFaqs}
      />

      <AudienceAppPromo audience="for-franchise" />

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
            <GatedForm>
              <FranchiseEnquiryForm />
            </GatedForm>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
