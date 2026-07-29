import { z } from "zod";

/**
 * Franchisee Application Form. Fields are grounded in the actual matching
 * criteria Connectors uses (see divisions.ts → franchise-development →
 * "How we match franchisees": investment capacity, business experience,
 * preferred territory, industry interest, operational capability).
 */
export const franchiseEnquirySchema = z
  .object({
    // Personal Information
    fullName: z.string().trim().min(2, "Enter your full name."),
    email: z.string().trim().email("Enter a valid email address."),
    mobile: z.string().trim().min(7, "Enter a valid mobile number."),
    cityOfResidence: z.string().trim().min(2, "Enter your city of residence."),

    // Investment & Experience
    investmentCapacity: z.string().min(1, "Select an investment capacity."),
    businessExperience: z.string().min(1, "Select your business experience."),
    currentBusiness: z.string().trim().optional(),

    // Franchise Preference
    industryInterest: z.array(z.string()).min(1, "Select at least one industry."),
    cities: z.array(z.string()).min(1, "Select at least one territory."),
    otherCity: z.string().trim().optional(),
    operationalCapability: z.string().min(1, "Select how you'd operate the franchise."),
  })
  .refine(
    (data) => !data.cities.includes("Other") || Boolean(data.otherCity?.length),
    { message: "Tell us which city.", path: ["otherCity"] },
  );

export type FranchiseEnquiryData = z.infer<typeof franchiseEnquirySchema>;

export const INVESTMENT_CAPACITIES = [
  "Under PKR 2,500,000",
  "PKR 2,500,000 – 5,000,000",
  "PKR 5,000,000 – 10,000,000",
  "Above PKR 10,000,000",
] as const;

export const BUSINESS_EXPERIENCE = [
  "First-time business owner",
  "1–3 years running a business",
  "3+ years running a business",
  "Currently own another franchise",
] as const;

export const OPERATIONAL_CAPABILITIES = [
  "I will operate it myself",
  "I will hire a manager",
  "I have a team ready to run it",
  "I plan to be an absentee owner",
] as const;

export const TERRITORY_CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Faisalabad",
  "Multan",
  "Other",
] as const;
