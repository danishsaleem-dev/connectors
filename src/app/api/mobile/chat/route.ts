import { NextResponse } from "next/server";
import { verifyMobileSession } from "@/lib/auth/mobile-session";
import { GREETING, HANDOFF, SUGGESTED_IDS } from "@/lib/chat/knowledge";
import { entryById, matchQuestion } from "@/lib/chat/match";

export const runtime = "nodejs";

/**
 * The app's Connectors AI, wrapping the exact same scripted matcher the
 * website's ChatWidget already uses (see src/lib/chat/match.ts's doc
 * comment) — there is no language model on either surface, just
 * deterministic keyword matching against src/lib/chat/knowledge.ts. Wired
 * as a thin server wrapper rather than porting the knowledge base and
 * matching logic into Dart, so there's exactly one place that ever needs
 * updating when an answer changes.
 *
 * Unlike the website (anonymous visitors, so a miss falls back to a
 * name/email/phone lead form — see submitChatLead), every app user is
 * already a known, signed-in org. A miss here just offers to send the
 * question straight to the org's real Connectors thread instead
 * (ApiClient.sendMessage on the app side) — same "goes through admin"
 * channel as everything else, no separate lead-capture flow needed.
 */
export async function GET(request: Request) {
  const session = await verifyMobileSession(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Session expired." }, { status: 401 });
  }

  const suggested = SUGGESTED_IDS.map((id) => entryById(id))
    .filter((e) => e != null)
    .map((e) => ({ id: e.id, question: e.question }));

  return NextResponse.json({ ok: true, greeting: GREETING, suggested });
}

export async function POST(request: Request) {
  const session = await verifyMobileSession(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Session expired." }, { status: 401 });
  }

  let body: { question?: string; entryId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // A suggested chip already names its entry — answer it directly rather
  // than re-running its own question text back through the matcher.
  if (body.entryId) {
    const entry = entryById(body.entryId);
    if (entry) {
      return NextResponse.json({
        ok: true,
        kind: "answer",
        answer: entry.answer,
        link: entry.link ?? null,
      });
    }
  }

  const question = (body.question ?? "").trim();
  if (!question) {
    return NextResponse.json({ ok: false, error: "Ask a question first." }, { status: 400 });
  }

  const result = matchQuestion(question);
  switch (result.kind) {
    case "answer":
      return NextResponse.json({
        ok: true,
        kind: "answer",
        answer: result.entry.answer,
        link: result.entry.link ?? null,
      });
    case "smalltalk":
      return NextResponse.json({ ok: true, kind: "smalltalk", answer: result.answer });
    case "escalate":
      return NextResponse.json({ ok: true, kind: "escalate", answer: result.answer });
    case "unknown":
      return NextResponse.json({ ok: true, kind: "unknown", answer: HANDOFF });
  }
}
