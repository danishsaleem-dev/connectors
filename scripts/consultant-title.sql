-- Connectors — add consultants.title.
-- Run in Supabase Dashboard → SQL Editor → New query → Run.
--
-- The professional title shown under the name on a public profile
-- ("Hospitality Operations Consultant"). Nullable, so existing rows are
-- valid as-is and the profile simply omits the line until one is set.

ALTER TABLE "consultants" ADD COLUMN IF NOT EXISTS "title" text;

-- Verify.
-- SELECT name, title FROM consultants ORDER BY created_at DESC LIMIT 20;
