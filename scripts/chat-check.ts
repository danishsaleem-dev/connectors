import { matchQuestion } from "@/lib/chat/match";

/**
 * `npm run chat:check` — asserts the chat widget still routes real questions to
 * the right place.
 *
 * The matcher is keyword-scored, so editing src/lib/chat/knowledge.ts can
 * silently change what an unrelated question matches. Run this after any edit
 * to that file. The two cases that matter most are the last group: questions we
 * must NOT answer (they escalate to a human) and questions we can't answer at
 * all (they must come back unknown rather than confidently wrong).
 */
const cases: [string, string][] = [
  ["hi", "smalltalk"],
  ["hello there", "smalltalk"],
  ["thanks", "smalltalk"],
  ["what does connectors do", "answer:what-we-do"],
  ["what do you guys do?", "answer:what-we-do"],
  ["what is your mission", "answer:mission"],
  ["which industries do you work in", "answer:industries"],
  ["where are your offices", "answer:locations"],
  ["do you have an office in lahore", "answer:locations"],
  ["how do I contact you", "answer:contact"],
  ["I want to buy a franchise", "answer:for-franchise"],
  ["I'm a landlord with a vacant shop", "answer:for-landlords"],
  ["we are a brand looking to expand", "answer:for-brands"],
  ["I want to invest", "answer:for-investors"],
  ["can you help me", "answer:what-we-do"],
  ["I want to franchise my business", "answer:franchise-development"],
  // A city we have no office in still resolves to the brand answer, which is
  // right — it describes how we source space without claiming we're in Dubai.
  ["do you have retail space in dubai", "answer:for-brands"],
  ["what sectors do you cover", "answer:industries"],
  ["I own a shopping centre", "answer:malls"],
  ["how does the process work", "answer:process"],
  ["what services do you offer", "answer:services"],
  ["do you charge a commission", "escalate"],
  ["can I see the contract", "escalate"],
  ["do you work with malls", "answer:malls"],
  ["how much does it cost", "escalate"],
  ["what are your fees", "escalate"],
  ["how long does the process take", "escalate"],
  ["are you hiring", "escalate"],
  ["do you handle the legal contracts", "escalate"],
  ["what's the weather in paris", "unknown"],
  ["can you write me a poem", "unknown"],
  ["asdkjhasd", "unknown"],
  ["do you have an app", "answer:app"],
  ["is there a portal login", "answer:portal"],
  ["what happens after signing", "answer:after-signing"],
  ["do you help small brands", "answer:small-brands"],
  ["do you do marketing", "answer:marketing"],
];

let fails = 0;
for (const [q, expected] of cases) {
  const r = matchQuestion(q);
  const actual = r.kind === "answer" ? `answer:${r.entry.id}` : r.kind;
  const ok = actual === expected;
  if (!ok) fails++;
  console.log(
    `${ok ? "ok  " : "FAIL"}  ${q.padEnd(36)} -> ${actual}${ok ? "" : `   (expected ${expected})`}`,
  );
}
console.log(`\n${cases.length - fails}/${cases.length} passed`);
if (fails > 0) process.exit(1);
