import {
  escalations,
  knowledge,
  smallTalk,
  type KnowledgeEntry,
} from "./knowledge";

/**
 * Deterministic question matching — no model, no API, no network.
 *
 * A visitor's question is scored against each knowledge entry's keywords, and
 * the best entry wins only if it clears a confidence threshold. Below the
 * threshold the caller hands off to a human rather than returning the
 * least-bad guess, which is the whole point: a scripted assistant that
 * confidently answers the wrong question is worse than one that admits the
 * limit and fetches a person.
 */

/** Words too common to carry meaning; stripped before scoring so they can't
 * inflate a match. Includes domain filler ("business", "company") that appears
 * in almost every question a visitor asks us. */
const STOPWORDS = new Set([
  "a", "about", "am", "an", "and", "any", "are", "as", "at", "be", "been",
  "business", "businesses", "but", "by", "can", "company", "could", "did", "do",
  "does", "doing", "for", "from", "get", "guys", "had", "has", "have", "help",
  "how", "i", "if", "in", "into", "is", "it", "its", "just", "know", "like",
  "me", "much", "my", "need", "of", "on", "or", "our", "out", "please", "so",
  "some", "tell", "than", "that", "the", "their", "them", "then", "there",
  "these", "they", "this", "to", "up", "us", "want", "was", "we", "were",
  "what", "when", "where", "which", "who", "will", "with", "would", "you",
  "your", "yours",
]);

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Crude suffix stripper — enough to match "industries"/"industry" and
 * "leasing"/"lease" without pulling in a stemming dependency. Short words are
 * left alone, where suffix rules do more harm than good. */
function stem(word: string) {
  if (word.length <= 4) return word;
  return word
    .replace(/ies$/, "y")
    .replace(/(sses|shes|ches|xes)$/, (m) => m.slice(0, -2))
    .replace(/([^s])s$/, "$1")
    .replace(/(ing|ed)$/, "");
}

function tokenize(text: string) {
  return normalize(text)
    .split(" ")
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
    .map(stem);
}

/**
 * Scores one keyword list against a question.
 *
 * Multi-word keywords are checked as substrings and weighted heavily — "buy a
 * franchise" appearing verbatim is near-proof of intent, whereas the single
 * word "franchise" appears in half our entries and can only ever be weak
 * evidence on its own.
 */
function scoreKeywords(query: string, queryTokens: string[], keywords: string[]) {
  let score = 0;
  const matchedTokens = new Set<string>();

  for (const keyword of keywords) {
    const normalized = normalize(keyword);

    if (normalized.includes(" ")) {
      // Verbatim phrase: strongest possible signal.
      if (query.includes(normalized)) {
        score += 4;
        for (const t of tokenize(normalized)) matchedTokens.add(t);
        continue;
      }

      // Otherwise score the phrase's *meaningful* words wherever they appear.
      // "expand my brand" has to match "we're a brand looking to expand" —
      // visitors don't phrase things the way keyword lists are written. Filler
      // is already stripped by tokenize(), so this compares the words that
      // actually carry the intent, not word order.
      const phraseTokens = tokenize(normalized);

      if (phraseTokens.length >= 2) {
        const present = phraseTokens.filter((t) => queryTokens.includes(t));
        const ratio = present.length / phraseTokens.length;
        // Below two thirds it's a coincidental word overlap, not the phrase.
        if (ratio >= 0.6) {
          score += 4 * ratio;
          for (const t of present) matchedTokens.add(t);
        }
        continue;
      }

      // A phrase that reduces to one meaningful word ("franchise my business")
      // is no stronger evidence than that word on its own, and must not be
      // scored as if a whole phrase had matched.
      if (phraseTokens.length === 1 && queryTokens.includes(phraseTokens[0])) {
        score += 2;
        matchedTokens.add(phraseTokens[0]);
      }
      continue;
    }

    const stemmed = stem(normalized);
    if (queryTokens.includes(stemmed)) {
      score += 2;
      matchedTokens.add(stemmed);
    }
  }

  // Coverage rewards entries that account for most of what was actually
  // asked, breaking ties between two entries that share one keyword.
  const coverage = queryTokens.length
    ? [...matchedTokens].filter((t) => queryTokens.includes(t)).length / queryTokens.length
    : 0;

  return score > 0 ? score + coverage * 2 : 0;
}

/** Tuned against the real questions in the verification pass; a single strong
 * phrase hit (4) or one distinctive keyword plus decent coverage clears it. */
const CONFIDENCE_THRESHOLD = 2.6;

export type MatchResult =
  | { kind: "answer"; entry: KnowledgeEntry }
  | { kind: "smalltalk"; answer: string }
  | { kind: "escalate"; answer: string; reason: string }
  | { kind: "unknown" };

export function matchQuestion(rawQuery: string): MatchResult {
  const query = normalize(rawQuery);
  if (!query) return { kind: "unknown" };
  const queryTokens = tokenize(rawQuery);

  // Small talk first: "hi" is 2 characters and would never out-score a real
  // entry, but answering it as unknown makes the widget feel broken.
  for (const item of smallTalk) {
    const hit = item.keywords.some((k) => {
      const n = normalize(k);
      return query === n || query.startsWith(`${n} `) || query.endsWith(` ${n}`);
    });
    if (hit) return { kind: "smalltalk", answer: item.answer };
  }

  // Escalations outrank knowledge deliberately. "How much does franchise
  // development cost" matches the franchise-development entry too, but the
  // question being asked is the price — and we don't answer prices from a
  // script.
  // "What do you guys do?", "can you help me", "what is this" — every word is
  // filler, so there is nothing to score, yet the intent is unmistakable and
  // it's one of the most common opening questions a visitor asks. Treat a
  // question built entirely of common words as "what do you do".
  if (queryTokens.length === 0) {
    const entry = knowledge.find((e) => e.id === "what-we-do");
    if (entry && query.includes(" ")) return { kind: "answer", entry };
    return { kind: "unknown" };
  }

  let bestEscalation: { score: number; item: (typeof escalations)[number] } | null = null;
  for (const item of escalations) {
    const score = scoreKeywords(query, queryTokens, item.keywords);
    if (score >= CONFIDENCE_THRESHOLD && (!bestEscalation || score > bestEscalation.score)) {
      bestEscalation = { score, item };
    }
  }
  if (bestEscalation) {
    return {
      kind: "escalate",
      answer: bestEscalation.item.answer,
      reason: bestEscalation.item.id,
    };
  }

  let best: { score: number; entry: KnowledgeEntry } | null = null;
  for (const entry of knowledge) {
    const score = scoreKeywords(query, queryTokens, [entry.question, ...entry.keywords]);
    if (!best || score > best.score) best = { score, entry };
  }

  if (best && best.score >= CONFIDENCE_THRESHOLD) {
    return { kind: "answer", entry: best.entry };
  }
  return { kind: "unknown" };
}

export function entryById(id: string) {
  return knowledge.find((e) => e.id === id);
}
