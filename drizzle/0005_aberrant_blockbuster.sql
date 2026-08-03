CREATE TYPE "public"."consultant_inquiry_status" AS ENUM('new', 'read', 'archived');--> statement-breakpoint
CREATE TABLE "consultant_inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultant_id" uuid,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"message" text NOT NULL,
	"status" "consultant_inquiry_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "consultant_inquiries" ADD CONSTRAINT "consultant_inquiries_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE set null ON UPDATE no action;