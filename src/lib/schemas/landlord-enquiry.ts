import { z } from "zod";

/**
 * Property Submission Form. Property types are transcribed exactly from
 * divisions.ts → landlord-services → "Property types".
 */
export const landlordEnquirySchema = z
  .object({
    // Contact Information
    fullName: z.string().trim().min(2, "Enter your full name."),
    companyName: z.string().trim().optional(),
    mobile: z.string().trim().min(7, "Enter a valid mobile number."),
    email: z.string().trim().email("Enter a valid email address."),

    // Property Details
    propertyTypes: z.array(z.string()).min(1, "Select at least one property type."),
    address: z.string().trim().min(3, "Enter the property address or location."),
    cities: z.array(z.string()).min(1, "Select at least one city."),
    otherCity: z.string().trim().optional(),
    totalAreaSqFt: z.coerce.number().positive("Enter the total area."),

    // Leasing Details
    availableFrom: z.string().min(1, "Select an availability date."),
    expectedRent: z.string().min(1, "Select an expected monthly rent range."),
    occupancyStatus: z.string().min(1, "Select the current occupancy status."),
  })
  .refine(
    (data) => !data.cities.includes("Other") || Boolean(data.otherCity?.length),
    { message: "Tell us which city.", path: ["otherCity"] },
  );

export type LandlordEnquiryData = z.infer<typeof landlordEnquirySchema>;

export const PROPERTY_TYPES = [
  "Retail shops",
  "Commercial units",
  "Food court spaces",
  "Standalone buildings",
  "Kiosks",
  "Showrooms",
  "Office spaces",
  "Mixed-use properties",
] as const;

export const PROPERTY_CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Faisalabad",
  "Multan",
  "Other",
] as const;

export const EXPECTED_RENT_RANGES = [
  "Under PKR 200,000",
  "PKR 200,000 – 500,000",
  "PKR 500,000 – 1,000,000",
  "Above PKR 1,000,000",
] as const;

export const OCCUPANCY_STATUSES = [
  "Vacant now",
  "Currently occupied, becoming vacant soon",
  "New construction / not yet built",
] as const;
