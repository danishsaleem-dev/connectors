CREATE TYPE "public"."document_kind" AS ENUM('document', 'agreement');--> statement-breakpoint
CREATE TYPE "public"."enquiry_source" AS ENUM('brand', 'franchisee', 'landlord', 'investor');--> statement-breakpoint
CREATE TYPE "public"."enquiry_status" AS ENUM('new', 'converted', 'archived');--> statement-breakpoint
CREATE TYPE "public"."org_status" AS ENUM('pending', 'active', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."org_type" AS ENUM('brand', 'franchisee', 'landlord', 'developer', 'investor');--> statement-breakpoint
CREATE TYPE "public"."property_status" AS ENUM('available', 'under_offer', 'leased', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('retail_shop', 'commercial_unit', 'food_court', 'standalone_building', 'kiosk', 'showroom', 'office', 'mixed_use');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('open', 'in_review', 'matched', 'closed');--> statement-breakpoint
CREATE TYPE "public"."request_type" AS ENUM('space', 'franchise', 'investment');--> statement-breakpoint
CREATE TABLE "brand_profiles" (
	"organization_id" uuid PRIMARY KEY NOT NULL,
	"industry" text,
	"description" text,
	"website" text,
	"founded_year" integer,
	"outlet_count" integer,
	"countries_present" text[],
	"is_franchising" boolean DEFAULT false NOT NULL,
	"franchise_investment_min" integer,
	"franchise_investment_max" integer,
	"franchise_fee" integer,
	"royalty_percent" integer,
	"space_required_sqft" integer,
	"currency" varchar(3) DEFAULT 'GBP' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "developer_profiles" (
	"organization_id" uuid PRIMARY KEY NOT NULL,
	"project_name" text,
	"project_type" text,
	"city" text,
	"total_units" integer,
	"occupancy_percent" integer,
	"opening_date" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"kind" "document_kind" DEFAULT 'document' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" "enquiry_source" NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"company_name" text,
	"summary" text NOT NULL,
	"payload" jsonb NOT NULL,
	"transcript" jsonb,
	"status" "enquiry_status" DEFAULT 'new' NOT NULL,
	"converted_org_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "franchisee_profiles" (
	"organization_id" uuid PRIMARY KEY NOT NULL,
	"budget_min" integer,
	"budget_max" integer,
	"currency" varchar(3) DEFAULT 'GBP' NOT NULL,
	"preferred_cities" text[],
	"industries_interested" text[],
	"experience_years" integer,
	"has_existing_business" boolean DEFAULT false NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "investor_profiles" (
	"organization_id" uuid PRIMARY KEY NOT NULL,
	"ticket_min" integer,
	"ticket_max" integer,
	"currency" varchar(3) DEFAULT 'GBP' NOT NULL,
	"sectors" text[],
	"horizon_months" integer,
	"investment_types" text[],
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "landlord_profiles" (
	"organization_id" uuid PRIMARY KEY NOT NULL,
	"cities" text[],
	"portfolio_size" integer,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"author_name" text NOT NULL,
	"author_is_admin" boolean NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "org_type" NOT NULL,
	"status" "org_status" DEFAULT 'pending' NOT NULL,
	"onboarding_completed_at" timestamp with time zone,
	"phone" text,
	"country" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"title" text NOT NULL,
	"property_type" "property_type" DEFAULT 'retail_shop' NOT NULL,
	"city" text NOT NULL,
	"country" text,
	"area" text,
	"map_address" text,
	"latitude" double precision,
	"longitude" double precision,
	"size_sqft" integer,
	"floor_level" text,
	"parking_available" boolean DEFAULT false NOT NULL,
	"rent_amount" integer,
	"rent_period" text DEFAULT 'month',
	"currency" varchar(3) DEFAULT 'GBP' NOT NULL,
	"available_from" text,
	"status" "property_status" DEFAULT 'available' NOT NULL,
	"description" text,
	"photos" text[],
	"video" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"type" "request_type" NOT NULL,
	"title" text NOT NULL,
	"cities" text[],
	"industries" text[],
	"budget_min" integer,
	"budget_max" integer,
	"currency" varchar(3) DEFAULT 'GBP' NOT NULL,
	"size_sqft" integer,
	"notes" text,
	"status" "request_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"organization_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "brand_profiles" ADD CONSTRAINT "brand_profiles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "developer_profiles" ADD CONSTRAINT "developer_profiles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_converted_org_id_organizations_id_fk" FOREIGN KEY ("converted_org_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "franchisee_profiles" ADD CONSTRAINT "franchisee_profiles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investor_profiles" ADD CONSTRAINT "investor_profiles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "landlord_profiles" ADD CONSTRAINT "landlord_profiles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;