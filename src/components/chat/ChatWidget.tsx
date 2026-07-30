"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUp, MessageSquare, X } from "lucide-react";
import { OrbitField } from "@/components/OrbitField";
import {
  GREETING,
  HANDOFF,
  SUGGESTED_IDS,
  type KnowledgeEntry,
} from "@/lib/chat/knowledge";
import { entryById, matchQuestion } from "@/lib/chat/match";
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
  /** Renders the contact card under the message. */
  handoff?: boolean;
};

const STORAGE_KEY = "connectors_chat_v1";
/** Two consecutive misses is enough to stop guessing and offer a person. */
const MISS_LIMIT = 2;

let seq = 0;
const nextId = () => `m${++seq}_${Date.now().toString(36)}`;

function assistantMessage(
  text: string,
  extra?: Pick<Message, "link" | "handoff">,
): Message {
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
        setMessages((m) => [
          ...m,
          assistantMessage(result.answer, { handoff: true }),
        ]);
        return;
      }

      // Unknown. First miss nudges toward the answerable set; a second gives up
      // and hands over rather than looping the visitor.
      misses.current += 1;
      setMessages((m) => [
        ...m,
        misses.current >= MISS_LIMIT
          ? assistantMessage(HANDOFF, { handoff: true })
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

  return (
    <>
      {/* Launcher */}
      <motion.button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="connectors-chat-panel"
        aria-label={open ? "Close help" : "Open help"}
        initial={false}
        whileHover={reduceMotion ? undefined : { scale: 1.04 }}
        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
        className={clsx(
          "fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-ink text-white shadow-[0_18px_40px_-16px_rgba(20,20,26,0.6)] ring-1 ring-white/10 transition-colors hover:bg-violet-600 md:bottom-7 md:right-7",
          open && "bg-violet-600",
        )}
      >
        <OrbitField
          count={14}
          strokeWidth={0.4}
          className="pointer-events-none absolute inset-0 h-full w-full text-white/20"
        />
        <span className="relative">
          {open ? <X size={20} /> : <MessageSquare size={20} />}
        </span>
      </motion.button>

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
            className="fixed inset-x-0 bottom-0 z-[59] flex h-[85vh] flex-col overflow-hidden rounded-t-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_-20px_60px_-20px_rgba(20,20,26,0.35)] sm:inset-x-auto sm:bottom-24 sm:right-5 sm:h-[min(34rem,calc(100vh-9rem))] sm:w-[24rem] sm:rounded-3xl md:right-7"
          >
            {/* Header */}
            <div className="relative shrink-0 overflow-hidden bg-ink px-5 py-4 text-white">
              <OrbitField
                count={22}
                strokeWidth={0.3}
                className="animate-orbit pointer-events-none absolute -right-16 top-1/2 h-40 w-40 -translate-y-1/2 text-white/[0.09]"
              />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-sm uppercase tracking-[0.16em]">
                    Connectors
                  </p>
                  <p className="mt-0.5 text-xs text-white/55">
                    Quick answers · a real person if you need one
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close help"
                  className="-mr-1 -mt-1 rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Transcript */}
            <div
              ref={scrollRef}
              className="no-scrollbar flex-1 space-y-3 overflow-y-auto bg-[var(--surface-sunken)] px-4 py-4"
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

              {!thinking && remainingSuggestions.length > 0 && (
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
              <div className="mt-2 flex items-center justify-between px-1">
                <p className="text-[10px] text-[var(--muted)]">
                  Answers common questions only
                </p>
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

        {message.handoff && <HandoffCard />}
      </div>
    </div>
  );
}

/** The escape hatch. Deliberately concrete — a phone number and an email beat
 * a promise that someone will be in touch. */
function HandoffCard() {
  return (
    <div className="mt-2 rounded-2xl border border-violet-600/20 bg-violet-50 p-3.5">
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-violet-600">
        Talk to a representative
      </p>
      <div className="mt-2.5 flex flex-col gap-1.5">
        <Link
          href="/contact"
          className="text-sm font-medium text-violet-700 underline underline-offset-4"
        >
          Send us a message →
        </Link>
        <a
          href={`mailto:${site.email.general}`}
          className="text-xs text-violet-700/80 underline underline-offset-4"
        >
          {site.email.general}
        </a>
        <a
          href={`tel:${site.primaryOffice.phone.href}`}
          className="text-xs text-violet-700/80 underline underline-offset-4"
        >
          {site.primaryOffice.phone.display}
        </a>
      </div>
    </div>
  );
}
