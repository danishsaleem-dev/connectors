import sanitizeHtml from "sanitize-html";

/**
 * Whitelist matching what the RichText editor can actually produce — the
 * StarterKit nodes/marks plus links. Anything else (scripts, iframes, event
 * handlers, style attributes) is stripped.
 *
 * This runs on save, in the server action, not at render time: the editor
 * constrains what the UI emits, but a hand-rolled POST to the action doesn't
 * go anywhere near the editor, and a self-service consultant can write their
 * own bio. Sanitizing once on the way in means every read path — the public
 * profile, metadata, the admin list — is dealing with known-safe HTML.
 */
export function sanitizeRichText(html: string | null | undefined): string | null {
  if (!html) return null;

  const clean = sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "s",
      "u",
      "h2",
      "h3",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
      "a",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      // Anything the editor emits as a link leaves the site, so it gets the
      // usual noopener treatment rather than relying on the author.
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
    },
  }).trim();

  // TipTap serialises an empty document as "<p></p>" — treat that as no bio
  // at all, so `{consultant.bio && ...}` guards keep working.
  return stripTags(clean) === "" ? null : clean;
}

/** Plain-text projection, for meta descriptions and list previews. */
export function stripTags(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
}
