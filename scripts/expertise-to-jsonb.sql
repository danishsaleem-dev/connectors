-- Connectors — migrate consultants.expertise from text[] to jsonb.
-- Run once in Supabase Dashboard → SQL Editor → New query → Run.
--
-- Each existing tag becomes {"name": "<tag>"}. Descriptions are optional and
-- simply absent until someone adds one, so no existing profile changes shape
-- on screen.
--
-- Done as add/backfill/drop/rename rather than ALTER COLUMN ... USING:
-- Postgres rejects subqueries in a transform expression, and turning an
-- array into one object per element needs unnest, which is a subquery.
--
-- Wrapped in a transaction — if any statement fails the column is left
-- exactly as it was.

BEGIN;

ALTER TABLE "consultants" ADD COLUMN "expertise_jsonb" jsonb;

UPDATE "consultants"
SET "expertise_jsonb" = COALESCE(
  (
    SELECT jsonb_agg(jsonb_build_object('name', tag) ORDER BY ord)
    FROM unnest("expertise") WITH ORDINALITY AS t(tag, ord)
    WHERE tag IS NOT NULL AND btrim(tag) <> ''
  ),
  '[]'::jsonb
)
WHERE "expertise" IS NOT NULL;

ALTER TABLE "consultants" DROP COLUMN "expertise";
ALTER TABLE "consultants" RENAME COLUMN "expertise_jsonb" TO "expertise";

COMMIT;

-- Verify — every row should show a JSON array of {"name": ...} objects.
-- SELECT name, expertise FROM consultants ORDER BY created_at DESC LIMIT 20;


-- ---------------------------------------------------------------------
-- Bios: plain text -> HTML
-- ---------------------------------------------------------------------
-- The bio column stays `text`, but it now holds HTML from the portal's
-- rich-text editor. Bios written before that are plain text whose only
-- structure is a blank line between paragraphs — rendered as HTML those
-- breaks collapse into one run-on block, so each paragraph is wrapped in
-- <p> here, with the text escaped so a stray "&" or "<" in someone's bio
-- can't turn into markup.
--
-- Skips anything that already contains a tag, so this is safe to re-run
-- and won't touch bios saved from the new editor.

BEGIN;

UPDATE "consultants" AS c
SET "bio" = sub.html
FROM (
  SELECT
    "id",
    string_agg(
      '<p>' ||
      replace(replace(replace(btrim(part), '&', '&amp;'), '<', '&lt;'), '>', '&gt;') ||
      '</p>',
      '' ORDER BY ord
    ) AS html
  FROM "consultants",
       LATERAL regexp_split_to_table(btrim("bio"), '\n[[:space:]]*\n')
         WITH ORDINALITY AS t(part, ord)
  WHERE "bio" IS NOT NULL
    AND btrim("bio") <> ''
    AND "bio" !~ '<[a-zA-Z]'
    AND btrim(part) <> ''
  GROUP BY "id"
) AS sub
WHERE c."id" = sub."id";

COMMIT;

-- Verify — bios should now start with <p>.
-- SELECT name, left(bio, 80) FROM consultants WHERE bio IS NOT NULL;
