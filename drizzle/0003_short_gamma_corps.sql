CREATE TYPE "public"."vendor_discipline" AS ENUM('designer', 'architect', 'interior', 'agency', 'consultant', 'contractor');--> statement-breakpoint
ALTER TYPE "public"."enquiry_source" ADD VALUE 'vendor';--> statement-breakpoint
ALTER TYPE "public"."org_type" ADD VALUE 'vendor';--> statement-breakpoint
CREATE TABLE "vendor_profiles" (
	"organization_id" uuid PRIMARY KEY NOT NULL,
	"discipline" "vendor_discipline" DEFAULT 'consultant' NOT NULL,
	"slug" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"headline" text,
	"bio" text,
	"website" text,
	"contact_email" text,
	"cities_served" text[],
	"specialties" text[],
	"years_experience" integer,
	"team_size" integer,
	"projects_completed" integer,
	"logo_url" text,
	"cover_url" text,
	CONSTRAINT "vendor_profiles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "vendor_profiles" ADD CONSTRAINT "vendor_profiles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;