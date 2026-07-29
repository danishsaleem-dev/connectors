import { z } from "zod";

/**
 * Investment Interest Form. Investment types are grounded in
 * divisions.ts → investor-connections → services list.
 */
export const investorEnquirySchema = z
  .object({
    // Contact Information
    fullName: z.string().trim().min(2, "Enter your full name."),
    email: z.string().trim().email("Enter a valid email address."),
    mobile: z.string().trim().min(7, "Enter a valid mobile number."),
    companyOrFund: z.string().trim().optional(),

    // Investment Profile
    ticketSize: z.string().min(1, "Select an investment ticket size."),
    investmentTypes: z.array(z.string()).min(1, "Select at least one investment type."),
    sectorInterest: z.array(z.string()).min(1, "Select at least one sector."),

    // Preferences
    cities: z.array(z.string()).min(1, "Select at least one city or region."),
    otherCity: z.string().trim().optional(),
    horizon: z.string().min(1, "Select an investment horizon."),
  })
  .refine(
    (data) => !data.cities.includes("Other") || Boolean(data.otherCity?.length),
    { message: "Tell us which city or region.", path: ["otherCity"] },
  );

export type InvestorEnquiryData = z.infer<typeof investorEnquirySchema>;

export const TICKET_SIZES = [
  "Under PKR 5,000,000",
  "PKR 5,000,000 – 20,000,000",
  "PKR 20,000,000 – 50,000,000",
  "Above PKR 50,000,000",
] as const;

export const INVESTMENT_TYPES = [
  "Franchise investment (multi-unit)",
  "Brand equity / growth capital",
  "Joint venture",
  "Commercial real estate / project",
  "Business acquisition",
] as const;

export const INVESTOR_CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Faisalabad",
  "Multan",
  "Other",
] as const;

export const INVESTMENT_HORIZONS = [
  "Short-term (1–2 years)",
  "Medium-term (3–5 years)",
  "Long-term (5+ years)",
] as const;
