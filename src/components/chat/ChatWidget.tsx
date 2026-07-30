"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUp, Check, Mail, Phone, Sparkles, X } from "lucide-react";
import { OrbitField } from "@/components/OrbitField";
import {
  GREETING,
  HANDOFF,
  SUGGESTED_IDS,
  type KnowledgeEntry,
} from "@/lib/chat/knowledge";
import { entryById, matchQuestion } from "@/lib/chat/match";
import { submitChatLead } from "@/lib/chat/lead";
import type { EnquirySource } from "@/lib/db/schema";
import { site } from "@/lib/site";

/**
 * Scripted help widget. There is no language model and no API call — every
 * answer comes from src/lib/chat/knowledge.ts, matched locally by
 * src/lib/chat/match.ts. That means zero per-message cost, no key to leak,
 * instant replies, and no possibility of the widget inventing a claim about
 * the business.
 *
 * The trade-off is coverage, so the design leans into it rather than hiding
 * it: suggested questions are always visible so a visitor can see the answerable
 * surface, and anything outside it routes to a human immediately instead of
 * guessing.
 */

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  link?: KnowledgeEntry["link"];
};

const STORAGE_KEY = "connectors_chat_v1";
/** Two consecutive misses is enough to stop guessing and offer a person. */
const MISS_LIMIT = 2;

let seq = 0;
const nextId = () => `m${++seq}_${Date.now().toString(36)}`;

function assistantMessage(text: string, extra?: Pick<Message, "link">): Message {
  return { id: nextId(), role: "assistant", text, ...extra };
}

/**
 * Restores the transcript on first render rather than in an effect, so the
 * panel never flashes a fresh greeting over a conversation already in progress.
 * Safe against hydration mismatch because the panel starts closed — none of
 * this is in the server HTML.
 */
function initialMessages(): Message[] {
  if (typeof window === "undefined") return [assistantMessage(GREETING)];
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Message[];
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {
    /* corrupt or unavailable storage — fall through to the greeting */
  }
  return [assistantMessage(GREETING)];
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  /** Shown once a human is warranted — by an escalation, by two misses, or
   * because the visitor asked for one. Never shown unprompted: a contact form
   * that opens on arrival is a popup, not an offer of help. */
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadDone, setLeadDone] = useState(false);
  /** What the conversation suggests they are, used only to pre-select the
   * form's dropdown. Last relevant question wins. */
  const [leadSource, setLeadSource] = useState<EnquirySource | null>(null);
  /** A ref, not state: nothing renders from it, and driving it through a
   * setState updater would risk appending the same message twice. */
  const misses = useRef(0);

  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  /* Persist so navigating between pages doesn't wipe the conversation. */
  useEffect(() => {
    if (messages.length) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
      } catch {
        /* private mode / quota — the transcript is not important enough to warn about */
      }
    }
  }, [messages]);

  /* Keep the newest message in view. */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, thinking, open]);

  /* Escape closes; focus moves into the panel on open and back to the FAB on close. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => inputRef.current?.focus(), 250);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open]);

  const respond = useCallback((question: string) => {
    const result = matchQuestion(question);

    // A short beat before the reply. Matching is synchronous and instant, so
    // this is purely so answers don't appear in the same frame as the question
    // — not a pretence of computation.
    const delay = reduceMotion ? 0 : 260;

    setThinking(true);
    window.setTimeout(() => {
      setThinking(false);

      if (result.kind === "answer") {
        misses.current = 0;
        // Remember what this reveals about them, so if they do leave details
        // the form is already pointing at the right team.
        if (result.entry.leadSource) setLeadSource(result.entry.leadSource);
        setMessages((m) => [
          ...m,
          assistantMessage(result.entry.answer, { link: result.entry.link }),
        ]);
        return;
      }

      if (result.kind === "smalltalk") {
        setMessages((m) => [...m, assistantMessage(result.answer)]);
        return;
      }

      if (result.kind === "escalate") {
        misses.current = 0;
        setLeadOpen(true);
        setMessages((m) => [...m, assistantMessage(result.answer)]);
        return;
      }

      // Unknown. First miss nudges toward the answerable set; a second gives up
      // and hands over rather than looping the visitor.
      misses.current += 1;
      if (misses.current >= MISS_LIMIT) setLeadOpen(true);
      setMessages((m) => [
        ...m,
        misses.current >= MISS_LIMIT
          ? assistantMessage(HANDOFF)
          : assistantMessage(
              "I don't have an answer for that one. Try one of the questions below, or ask about our services, industries or offices — and I can put you through to a representative any time.",
            ),
      ]);
    }, delay);
  }, [reduceMotion]);

  const send = useCallback(
    (question: string) => {
      const trimmed = question.trim().slice(0, 300);
      if (!trimmed || thinking) return;
      setMessages((m) => [...m, { id: nextId(), role: "user", text: trimmed }]);
      setInput("");
      respond(trimmed);
    },
    [respond, thinking],
  );

  function reset() {
    setMessages([assistantMessage(GREETING)]);
    misses.current = 0;
    setLeadOpen(false);
    setLeadSource(null);
    // leadDone deliberately survives: someone who already gave us their details
    // shouldn't be asked for them again just because they cleared the chat.
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing to clean up */
    }
  }

  const suggestions = SUGGESTED_IDS.map(entryById).filter(
    (e): e is KnowledgeEntry => Boolean(e),
  );
  const asked = new Set(
    messages.filter((m) => m.role === "user").map((m) => m.text.toLowerCase()),
  );
  const remainingSuggestions = suggestions.filter(
    (s) => !asked.has(s.question.toLowerCase()),
  );
  /** Nothing but the greeting yet, so the launcher still has something to say. */
  const idle = !open && messages.length <= 1;

  return (
    <>
      {/* Launcher. Idle = closed and not yet used, which is the only time it
          asks for attention; once there's a conversation the halo stops. */}
      <div className="fixed bottom-5 right-5 z-[60] md:bottom-7 md:right-7">
        {idle && !reduceMotion && (
          <>
            <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-violet-600/25 [animation-duration:2.8s]" />
            <span className="pointer-events-none absolute -inset-2 rounded-full bg-violet-600/10 blur-lg" />
          </>
        )}

        <motion.button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="connectors-chat-panel"
          aria-label={open ? "Close help" : "Open help"}
          initial={false}
          whileHover={reduceMotion ? undefined : { scale: 1.03 }}
          whileTap={reduceMotion ? undefined : { scale: 0.97 }}
          className={clsx(
            "group relative flex h-16 items-center overflow-hidden rounded-full text-white ring-1 ring-white/15",
            "bg-gradient-to-br from-violet-700 via-violet-900 to-ink",
            "shadow-[0_18px_45px_-12px_rgba(75,46,131,0.75)]",
          )}
        >
          <OrbitField
            count={16}
            strokeWidth={0.4}
            className="animate-orbit pointer-events-none absolute -right-4 top-1/2 h-20 w-20 -translate-y-1/2 text-white/15"
          />

          {/* Sparkles is the near-universal "assistant" glyph now, so it reads
              as one instantly. The copy still says what this actually is —
              the icon sets the expectation of help, not of a language model. */}
          <span className="relative flex h-16 w-16 shrink-0 items-center justify-center">
            {open ? <X size={21} /> : <Sparkles size={22} strokeWidth={1.9} />}
          </span>

          {/* Label unfurls on hover. Width-based rather than mounted on hover so
              nothing reflows the page, and it stays out of the way on mobile
              where there is no hover and the screen is narrow. */}
          <span
            className={clsx(
              "relative hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium tracking-tight opacity-0 transition-all duration-300 ease-[var(--ease-out-expo)] sm:block",
              !open && "group-hover:max-w-[11rem] group-hover:pr-6 group-hover:opacity-100",
            )}
          >
            Ask a question
          </span>
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="connectors-chat-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="false"
            aria-label="Connectors help"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 z-[59] flex h-[85vh] flex-col overflow-hidden rounded-t-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_-20px_60px_-20px_rgba(20,20,26,0.35)] sm:inset-x-auto sm:bottom-28 sm:right-5 sm:h-[min(34rem,calc(100vh-10rem))] sm:w-[24rem] sm:rounded-3xl md:right-7"
          >
            {/* Header */}
            <div className="relative shrink-0 overflow-hidden bg-ink px-5 py-4 text-white">
              <OrbitField
                count={22}
                strokeWidth={0.3}
                className="animate-orbit pointer-events-none absolute -right-16 top-1/2 h-40 w-40 -translate-y-1/2 text-white/[0.09]"
              />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                    <Sparkles size={14} strokeWidth={2} />
                  </span>
                  <div>
                    <p className="font-display text-sm uppercase tracking-[0.16em]">
                      Connectors
                    </p>
                    <p className="mt-0.5 text-xs text-white/55">
                      Quick answers · a real person if you need one
                    </p>
                  </div>
                </div>

                <div className="-mr-1 -mt-1 flex items-center gap-0.5">
                  {/* Call and email sit here rather than only inside a handoff
                      card, so someone who'd simply rather talk never has to
                      work through the assistant to find the way out. */}
                  <a
                    href={`tel:${site.primaryOffice.phone.href}`}
                    aria-label={`Call us on ${site.primaryOffice.phone.display}`}
                    title={site.primaryOffice.phone.display}
                    className="rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Phone size={15} />
                  </a>
                  <a
                    href={`mailto:${site.email.general}`}
                    aria-label={`Email us at ${site.email.general}`}
                    title={site.email.general}
                    className="rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Mail size={15} />
                  </a>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close help"
                    className="rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Transcript.
                data-lenis-prevent is load-bearing: Lenis drives the document
                scroller and swallows wheel events site-wide, which leaves a
                nested scroller like this one unable to scroll at all. */}
            <div
              ref={scrollRef}
              data-lenis-prevent
              className="slim-scrollbar flex-1 space-y-3 overflow-y-auto overscroll-contain bg-[var(--surface-sunken)] px-4 py-4"
            >
              <div aria-live="polite" className="space-y-3">
                {messages.map((m) => (
                  <Bubble key={m.id} message={m} />
                ))}
              </div>

              {thinking && (
                <div className="flex gap-1.5 rounded-2xl rounded-bl-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3 w-fit">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400"
                      style={{ animationDelay: `${i * 120}ms` }}
                    />
                  ))}
                </div>
              )}

              {!thinking && !leadOpen && remainingSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {remainingSuggestions.slice(0, 4).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => send(s.question)}
                      className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-left text-xs text-[var(--muted)] transition-colors hover:border-violet-400 hover:text-violet-600"
                    >
                      {s.question}
                    </button>
                  ))}
                </div>
              )}

              {leadOpen && !leadDone && (
                <LeadForm
                  defaultSource={leadSource}
                  messages={messages}
                  onDone={() => setLeadDone(true)}
                  onDismiss={() => setLeadOpen(false)}
                />
              )}

              {leadDone && (
                <div className="flex items-start gap-2.5 rounded-2xl border border-violet-600/20 bg-violet-50 p-4">
                  <Check size={16} className="mt-0.5 shrink-0 text-violet-600" />
                  <p className="text-sm leading-relaxed text-violet-900">
                    Thanks — we have your details and one of our representatives
                    will be in touch. You can keep asking questions here meanwhile.
                  </p>
                </div>
              )}
            </div>

            {/* Composer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="shrink-0 border-t border-[var(--border)] bg-[var(--surface)] px-3 py-3"
            >
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={300}
                  placeholder="Ask a question…"
                  aria-label="Ask a question"
                  className="min-w-0 flex-1 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-[var(--muted)]/60 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || thinking}
                  aria-label="Send"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white transition-all hover:bg-violet-700 disabled:pointer-events-none disabled:opacity-40"
                >
                  <ArrowUp size={17} />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 px-1">
                {/* Always available, so someone ready to talk doesn't have to
                    fail a question first to find the way through to a person. */}
                {leadDone ? (
                  <p className="text-[10px] text-[var(--muted)]">
                    Answers common questions only
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => setLeadOpen(true)}
                    className="text-[10px] font-medium text-violet-600 underline underline-offset-2 transition-colors hover:text-violet-700"
                  >
                    Talk to a representative
                  </button>
                )}
                {messages.length > 1 && (
                  <button
                    type="button"
                    onClick={reset}
                    className="text-[10px] text-[var(--muted)] underline underline-offset-2 transition-colors hover:text-violet-600"
                  >
                    Start over
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const SOURCE_OPTIONS: { value: EnquirySource; label: string }[] = [
  { value: "brand", label: "A brand looking to expand" },
  { value: "franchisee", label: "Looking to buy a franchise" },
  { value: "landlord", label: "A landlord / property owner" },
  { value: "investor", label: "An investor" },
];

const leadFieldClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none transition-colors placeholder:text-[var(--muted)]/60 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20";

/**
 * The only part of the widget that talks to the server. Kept deliberately short
 * — a visitor mid-conversation will abandon a long form, and everything else we
 * might ask can be asked by the representative who calls them back.
 */
function LeadForm({
  defaultSource,
  messages,
  onDone,
  onDismiss,
}: {
  defaultSource: EnquirySource | null;
  messages: Message[];
  onDone: () => void;
  onDismiss: () => void;
}) {
  const [state, formAction, pending] = useActionState(submitChatLead, null);

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state?.ok, onDone]);

  // Sent as one hidden field rather than a structured body, because this posts
  // through a plain server action alongside the rest of the form.
  const transcript = JSON.stringify(
    messages.map((m) => ({ role: m.role, text: m.text })),
  );

  return (
    <form
      action={formAction}
      className="space-y-2.5 rounded-2xl border border-violet-600/20 bg-violet-50 p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-violet-600">
            Talk to a representative
          </p>
          <p className="mt-1 text-xs leading-relaxed text-violet-900/80">
            Leave your details and we&rsquo;ll come back to you.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-mr-1 -mt-1 rounded-full p-1 text-violet-900/40 transition-colors hover:bg-violet-600/10 hover:text-violet-900"
        >
          <X size={14} />
        </button>
      </div>

      {/* Honeypot — real visitors never see or fill this. */}
      <input
        type="text"
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <input type="hidden" name="transcript" value={transcript} />

      <input name="name" required placeholder="Your name" aria-label="Your name" className={leadFieldClass} />
      <input
        name="email"
        type="email"
        required
        placeholder="Email address"
        aria-label="Email address"
        className={leadFieldClass}
      />
      <input
        name="phone"
        type="tel"
        placeholder="Phone (optional)"
        aria-label="Phone number"
        className={leadFieldClass}
      />
      <select
        name="source"
        required
        aria-label="Which describes you"
        defaultValue={defaultSource ?? ""}
        className={leadFieldClass}
      >
        <option value="" disabled>
          Which describes you?
        </option>
        {SOURCE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <textarea
        name="note"
        rows={2}
        placeholder="Anything else? (optional)"
        aria-label="Anything else"
        className={clsx(leadFieldClass, "resize-none")}
      />

      {state?.error && (
        <p role="alert" className="text-xs text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send my details"}
      </button>

      <div className="flex items-center justify-center gap-3 pt-0.5 text-[11px] text-violet-900/60">
        <a
          href={`tel:${site.primaryOffice.phone.href}`}
          className="flex items-center gap-1.5 transition-colors hover:text-violet-700"
        >
          <Phone size={12} /> Call us
        </a>
        <span aria-hidden="true" className="text-violet-900/25">
          ·
        </span>
        <a
          href={`mailto:${site.email.general}`}
          className="flex items-center gap-1.5 transition-colors hover:text-violet-700"
        >
          <Mail size={12} /> Email us
        </a>
      </div>
    </form>
  );
}

function Bubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={clsx("flex", isUser ? "justify-end" : "justify-start")}>
      <div className={clsx("max-w-[85%]", isUser && "items-end")}>
        <div
          className={clsx(
            "px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "rounded-2xl rounded-br-md bg-violet-600 text-white"
              : "rounded-2xl rounded-bl-md border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]",
          )}
        >
          {message.text}
        </div>

        {message.link && (
          <Link
            href={message.link.href}
            className="mt-1.5 inline-block text-xs text-violet-600 underline underline-offset-4 transition-colors hover:text-violet-700"
          >
            {message.link.label} →
          </Link>
        )}

      </div>
    </div>
  );
}

/**
 * There is deliberately no per-message contact card. Every path that used to
 * render one now opens the lead form instead, which carries the same call and
 * email options — and the panel header carries them at all times. Three copies
 * of the same phone number stacked on top of each other helped nobody.
 */
