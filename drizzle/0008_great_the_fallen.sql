ALTER TABLE "consultants" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "consultants" ADD CONSTRAINT "consultants_slug_unique" UNIQUE("slug");