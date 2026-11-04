// Lane D (Khaliq). Offline self-test: no API key, no network, no cost.
// Feeds canned (fictional) model replies through the real engine and checks the guardrails.
//
//   npx tsx server/ai/selftest.ts

import assert from "node:assert/strict";
import { NOT_SURE, SCORE_KEYS, type PlanInput } from "../../src/types/roadmap.js";
import type { MessagesClient } from "./client.js";
import { generateFollowUpRound, generateImprovedPlan, generatePlan, getCostSummary, setClientForTests, toPreview, toUnlocked, AiError } from "./index.js";
import { parseModelJson, stripCodeFences } from "./parse.js";
import { combinedScore, ratingFromValue } from "./score.js";

// Fictional persona, matching the DESIGN.md example.
const input: PlanInput = {
  intake: {
    idea: "Mobile bike repair, coming to people's homes",
    customer: "Commuters and families",
    howItMakesMoney: "Charge per repair",
    budget: "£300",
    hoursPerWeek: "6",
    skills: "Fixed my own bikes for years",
    stage: "Just an idea",
    location: "Gateshead",
  },
  followUps: [{ round: 1, id: "r1q1", question: "What would you charge for a puncture repair?", answer: NOT_SURE }],
  verifiedLocalSupport: [{ name: "Example Verified Hub", whatItOffers: "Free start-up workshops", link: "https://example.org" }],
};

const followUpReply = {
  businessType: "services",
  enough: false,
  reason: "Need pricing and demand evidence.",
  questions: [
    { id: "r1q1", text: "Has anyone said they would pay?", why: "Shows demand.", type: "choice", options: ["Yes", "No", "Not sure"] },
    { id: "r1q1", text: "Roughly what would you charge?", why: "Checks the numbers.", type: "choice", options: ["£10"] },
    { id: "r1q3", text: "q3", why: "", type: "text", options: [] },
    { id: "r1q4", text: "q4", why: "", type: "text", options: [] },
    { id: "r1q5", text: "q5", why: "", type: "text", options: [] },
    { id: "r1q6", text: "q6 should be cut", why: "", type: "text", options: [] },
  ],
};

const planReply = {
  summary: { idea: "Mobile bike repair at people's homes in Gateshead.", place: "Gateshead", basedOn: "Based on 6 hours a week and a £300 budget." },
  scores: {
    financialStability: { value: 62, reason: "Low start-up costs, but prices are untested." },
    longTermSustainability: { value: 70, reason: "Bikes always need fixing." },
    roomInMarket: { value: 48, reason: "Shops nearby already offer repairs." },
    skillsAndAbility: { value: 140, reason: "Strong hands-on experience." }, // out of range on purpose
  },
  overallReason: "Demand and pricing are unproven.",
  topRisks: [{ title: "Demand may be seasonal", detail: "Fewer repairs in winter." }],
  otherRisks: [
    { title: "Travel time", detail: "Travel eats into 6 hours a week." },
    { title: "Insurance", detail: "Working in people's homes needs cover." },
  ],
  improvements: {
    financialStability: [{ title: "Set a price list", why: "Untested prices.", cheapCheck: "Ask 10 cyclists." }],
    longTermSustainability: [{ title: "Add servicing plans", why: "Repeat income.", cheapCheck: "Offer to 5 people." }],
    roomInMarket: [{ title: "Target workplaces", why: "Shops don't come to you.", cheapCheck: "Ask two employers." }],
    skillsAndAbility: [],
  },
  roadmap: [
    { title: "Test demand cheaply", firstStep: "Post in local groups.", cheapTest: "Take 5 bookings.", costGBP: { min: 0, max: 0 }, weeks: { min: 1, max: 2 }, hoursPerWeek: 4, goSignal: "5 bookings." },
    { title: "First paying customers", firstStep: "Buy a basic kit.", cheapTest: "Do 10 repairs.", costGBP: { min: 150, max: 80 }, weeks: { min: 4, max: 6 }, hoursPerWeek: 12, goSignal: "10 paid repairs." },
  ],
  professionalAdvice: [{ topic: "Insurance", why: "You work in people's homes.", whoToAsk: "an insurance broker" }],
  localSupport: [
    { name: "example verified hub", whatItOffers: "made up by model", link: "https://wrong.example" },
    { name: "Invented Enterprise Fund", whatItOffers: "Grants", link: "https://invented.example" },
  ],
  assumptions: ["Price per repair is about £15 (you said Not sure)."],
  limits: ["I can't check how many mobile repairers already work in Gateshead."],
};

const improvedReply = {
  positioning: { niche: "Workplace bike repair", customer: "Commuters", whyYou: "Comes to them." },
  offer: [{ title: "Puncture fix", detail: "At your workplace." }],
  pricing: { approach: "Flat prices", working: "£15 x 10 = £150 (assumed)." },
  findingCustomers: [{ title: "Employers", firstAction: "Email two", costGBP: { min: 0, max: 0 } }],
  money: { startupCosts: [{ item: "Tool kit", costGBP: { min: 80, max: 150 } }], monthlyCosts: [], breakEven: "About 6 repairs a month." },
  runningIt: [{ title: "Bookings", detail: "Use a free form." }],
  milestones: [{ by: "Week 4", goal: "10 repairs", measure: "Count them." }],
  mustBeTrue: ["People will pay £15."],
  stopSignals: ["Fewer than 3 bookings in a month.", "Travel costs more than you earn."],
  risksAndResponses: [{ risk: "Winter dip", response: "Offer servicing plans." }],
};

/** Fake SDK client: returns the next canned reply, wrapped like a real Message. */
function fakeClient(replies: string[], seen: unknown[]): MessagesClient {
  return {
    messages: {
      create: async (params: unknown) => {
        seen.push(params);
        const text = replies.shift();
        if (text === undefined) throw new Error("no more fake replies");
        return {
          stop_reason: "end_turn",
          content: [{ type: "thinking", thinking: "" }, { type: "text", text }],
          usage: { input_tokens: 2500, output_tokens: 1200 },
        };
      },
    },
  } as unknown as MessagesClient;
}

async function main() {
  // Pure helpers
  assert.equal(stripCodeFences('```json\n{"a":1}\n```'), '{"a":1}');
  assert.deepEqual(parseModelJson('Here you go: {"a":1} hope that helps'), { a: 1 });
  assert.throws(() => parseModelJson("not json"), (e: unknown) => e instanceof AiError && e.code === "parse");
  assert.equal(Math.round(combinedScore([100, 100, 100, 10]) * 10) / 10, 10.7);
  assert.equal(Math.round(combinedScore([90, 90, 90, 100]) * 10) / 10, 91.1);
  assert.equal(ratingFromValue(80), "Strong");
  assert.equal(ratingFromValue(34), "Not viable yet");

  process.env.ANTHROPIC_API_KEY ||= "test-key-not-used";
  const seen: unknown[] = [];
  setClientForTests(
    fakeClient(
      [
        JSON.stringify(followUpReply),
        "```json\n" + JSON.stringify(planReply) + "\n```", // fenced on purpose
        JSON.stringify(improvedReply),
      ],
      seen,
    ),
  );

  // Follow-up round
  const fu = await generateFollowUpRound({ intake: input.intake, followUps: [], round: 1, maxRounds: 1 }, { sessionId: "test-1" });
  assert.equal(fu.businessType, "services");
  assert.equal(fu.round.questions.length, 5, "capped at 5 questions");
  assert.deepEqual(fu.round.questions[0].options, ["Yes", "No"], "model's Not sure removed");
  assert.equal(fu.round.questions[1].type, "text", "choice with 1 option becomes text");
  assert.notEqual(fu.round.questions[0].id, fu.round.questions[1].id, "ids made unique");
  const sentPrompt = JSON.stringify(seen[0]);
  assert.ok(!sentPrompt.includes("{{"), "every placeholder filled");
  await assert.rejects(
    generateFollowUpRound({ intake: input.intake, followUps: [], round: 4, maxRounds: 9 }),
    (e: unknown) => e instanceof AiError && e.code === "config",
    "round cap enforced",
  );

  // Call 1
  const sp = await generatePlan(input, { sessionId: "test-1", businessType: fu.businessType });
  assert.equal(sp.internal.scoreValues.skillsAndAbility, 100, "score clamped to 100");
  assert.equal(sp.plan.verdict.scores.roomInMarket.rating, "Needs work");
  assert.equal(sp.plan.verdict.overall.rating, "Needs work", "overall held down by weakest score");
  assert.equal(sp.plan.verdict.topRisks.length, 2, "always 2 top risks");
  assert.deepEqual(sp.plan.roadmap[1].costGBP, { min: 80, max: 150 }, "min/max swapped");
  assert.equal(sp.plan.roadmap[1].hoursPerWeek, 6, "hours capped at stated 6");
  assert.deepEqual(sp.plan.localSupport, input.verifiedLocalSupport, "only verified support, verified details");

  // Preview must not leak paid content or numbers
  const preview = toPreview(sp);
  const previewJson = JSON.stringify(preview);
  for (const key of ["improvements", "roadmap", "otherRisks", "internal"]) {
    assert.ok(!(key in preview), `preview leaks section ${key}`);
  }
  // Paid text and internal numbers must not appear anywhere, even nested.
  // ("Travel time" was promoted to a free top risk because the model gave only one, so it is allowed.)
  assert.equal(preview.verdict.topRisks[1].title, "Travel time", "short top-risk list topped up from otherRisks");
  for (const text of ["Set a price list", "Working in people's homes needs cover", "Post in local groups", "scoreValues", "overallValue", "\"value\""]) {
    assert.ok(!previewJson.includes(text), `preview leaks ${text}`);
  }
  assert.equal(preview.locked.roadmapSteps, 2);
  for (const key of SCORE_KEYS) assert.equal(typeof preview.verdict.scores[key].rating, "string");

  // Call 2
  const improved = await generateImprovedPlan(input, sp, { sessionId: "test-1" });
  assert.equal(improved.stopSignals.length, 2);
  const unlocked = toUnlocked(sp, improved);
  assert.equal(unlocked.access, "full");
  assert.ok(!JSON.stringify(unlocked).includes("scoreValues"), "unlocked plan has no internal numbers");

  const cost = getCostSummary();
  assert.equal(cost.calls, 3);
  assert.equal(cost.sessions, 1);

  setClientForTests(null);
  console.log("\nAll self-tests passed.");
  console.log("Cost summary (fake token counts):", JSON.stringify(cost, null, 2));
}

main().catch((err) => {
  console.error("SELF-TEST FAILED:", err);
  process.exit(1);
});
