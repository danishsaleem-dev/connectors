import { z } from "zod";

/**
 * The Brand Expansion Request Form — fields transcribed exactly from the
 * client-supplied form spec. Every asterisked field there is `required` here;
 * everything else is optional.
 */
export const brandEnquirySchema = z
  .object({
    // Company Information
    brandName: z.string().trim().min(2, "Enter the brand name."),
    companyName: z.string().trim().min(2, "Enter the company name."),
    contactName: z.string().trim().min(2, "Enter the contact person's name."),
    designation: z.string().trim().optional(),
    mobile: z.string().trim().min(7, "Enter a valid mobile number."),
    email: z.string().trim().email("Enter a valid email address."),
    website: z.string().trim().optional(),

    // Expansion Requirement
    cities: z.array(z.string()).min(1, "Select at least one city."),
    otherCity: z.string().trim().optional(),
    preferredAreas: z
      .string()
      .trim()
      .min(3, "Tell us the areas you're interested in."),

    // Space Requirement
    outletTypes: z.array(z.string()).min(1, "Select at least one outlet type."),
    otherOutletType: z.string().trim().optional(),
    areaMin: z.coerce.number().positive("Enter a minimum area."),
    areaMax: z.coerce.number().positive("Enter a maximum area."),
    locationTypes: z
      .array(z.string())
      .min(1, "Select at least one preferred location type."),

    // Financial Requirement
    rentalBudget: z.string().min(1, "Select a monthly rental budget."),

    // Additional Services Required — optional
    additionalServices: z.array(z.string()).optional(),
  })
  .refine((data) => data.areaMax >= data.areaMin, {
    message: "Maximum area should be greater than or equal to the minimum.",
    path: ["areaMax"],
  })
  .refine(
    (data) => !data.cities.includes("Other") || Boolean(data.otherCity?.length),
    { message: "Tell us which city.", path: ["otherCity"] },
  )
  .refine(
    (data) =>
      !data.outletTypes.includes("Other") || Boolean(data.otherOutletType?.length),
    { message: "Tell us the outlet type.", path: ["otherOutletType"] },
  );

export type BrandEnquiryData = z.infer<typeof brandEnquirySchema>;

export const REQUIRED_CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Faisalabad",
  "Multan",
  "Other",
] as const;

export const OUTLET_TYPES = [
  "Restaurant",
  "Coffee Shop",
  "Clothing",
  "Pharmacy",
  "Electronics",
  "Grocery",
  "Other",
] as const;

export const LOCATION_TYPES = [
  "Mall",
  "High Street",
  "Commercial Plaza",
  "Standalone Building",
  "Mixed Use Development",
] as const;

export const RENTAL_BUDGETS = [
  "Under 200,000",
  "200,000 – 500,000",
  "500,000 – 1,000,000",
  "Above 1,000,000",
] as const;

export const ADDITIONAL_SERVICES = [
  "Location Sourcing",
  "Lease Negotiation",
  "Interior Design",
  "Fit-Out Execution",
  "Construction & Renovation",
  "Signage & Branding",
  "Mall Leasing Support",
  "Legal Documentation",
  "Retail Expansion Consultancy",
] as const;
