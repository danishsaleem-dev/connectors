ALTER TYPE "public"."org_type" ADD VALUE 'consultant';--> statement-breakpoint
ALTER TABLE "consultants" ADD COLUMN "organization_id" uuid;--> statement-breakpoint
ALTER TABLE "consultants" ADD CONSTRAINT "consultants_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultants" ADD CONSTRAINT "consultants_organization_id_unique" UNIQUE("organization_id");