// Lane E offline test: starts the real server with a FAKE AI (no key, no network, no cost) and checks the rules.
//   cd server && npm test
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { SCORE_KEYS } from "../src/types/roadmap.js";
import { setClientForTests } from "./ai/index.js";
import type { MessagesClient } from "./ai/client.js";
import { createApp } from "./index.js";
import { groqClient } from "./groq.js";
import { followUpReply, improvedReply, input, planReply } from "./fixtures.js";

process.env.ANTHROPIC_API_KEY = "test-key-not-real";
process.env.MAX_ROUNDS = "1";
process.env.AI_CALLS_PER_IP_PER_HOUR = "1000";

let replies: unknown[] = [];
const fake: MessagesClient = {
  messages: {
    create: async () => {
      const next = replies.shift();
      if (next === undefined) throw new Error("no more fake replies");
      return {
        stop_reason: "end_turn",
        content: [{ type: "text", text: JSON.stringify(next) }],
        usage: { input_tokens: 2500, output_tokens: 1200 },
      };
    },
  },
} as unknown as MessagesClient;
setClientForTests(fake);

const server = createApp();
await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

async function post(path: string, body: unknown) {
  const r = await fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { status: r.status, json: (await r.json()) as any };
}
const get = (path: string) => fetch(base + path);

try {
  // health
  const h = await (await get("/api/health")).json();
  assert.equal(h.ai, true);
  assert.equal(h.maxRounds, 1);

  // follow-up round 1
  replies = [followUpReply];
  const fu = await post("/api/followups", { intake: input.intake, followUps: [], round: 1 });
  assert.equal(fu.status, 200);
  assert.ok(fu.json.sessionId);
  assert.ok(fu.json.round.questions.length <= 5);
  assert.equal(fu.json.businessType, undefined, "business type must stay on the server");
  assert.equal(fu.json.round.businessType, undefined);
  const sessionId = fu.json.sessionId as string;

  // round cap: round 2 is refused when MAX_ROUNDS is 1, and the AI is never called
  replies = [followUpReply];
  const r2 = await post("/api/followups", { sessionId, intake: input.intake, followUps: [], round: 2 });
  assert.equal(r2.status, 400);
  assert.equal(replies.length, 1, "AI must not be called past the cap");

  // no idea -> 400
  assert.equal((await post("/api/followups", { intake: { idea: "  " }, round: 1 })).status, 400);

  // plan: preview only, numbers 0-100, nothing paid, nothing internal
  replies = [planReply];
  const plan = await post("/api/plan", { sessionId, intake: input.intake, followUps: input.followUps });
  assert.equal(plan.status, 200);
  const preview = plan.json.preview;
  assert.equal(preview.access, "preview");
  for (const paid of ["improvements", "roadmap", "otherRisks", "improvedPlan", "internal", "scoreValues"]) {
    assert.equal(paid in preview, false, `${paid} must not be in the preview`);
  }
  assert.equal(JSON.stringify(plan.json).includes("scoreValues"), false);
  const { overall, scores } = plan.json.numbers;
  for (const k of SCORE_KEYS) assert.ok(scores[k] >= 0 && scores[k] <= 100, `${k} out of range`);
  const mean = SCORE_KEYS.reduce((a, k) => a + scores[k], 0) / 4;
  const min = Math.min(...SCORE_KEYS.map((k) => scores[k]));
  assert.ok(overall >= min - 1 && overall <= mean + 1, "overall sits between the lowest score and the mean (score-algorithm.md)");
  assert.equal(preview.verdict.topRisks.length, 2);
  assert.ok(["Not viable yet", "Needs work", "Promising", "Strong"].includes(preview.verdict.overall.rating));
  console.log("numbers:", JSON.stringify(plan.json.numbers));

  // paywall: improved plan refused before payment, and the AI is not called
  replies = [improvedReply];
  const early = await post("/api/improved-plan", { sessionId });
  assert.equal(early.status, 402);
  assert.equal(replies.length, 1);

  // unlock (mock) -> full call-1 plan, still no internal numbers block
  const unlocked = await post("/api/unlock", { sessionId });
  assert.equal(unlocked.status, 200);
  assert.equal(unlocked.json.unlocked.access, "full");
  assert.ok(unlocked.json.unlocked.roadmap.length > 0);
  assert.equal("internal" in unlocked.json.unlocked, false);

  // call 2, only after payment, and only once even if asked twice
  const imp = await post("/api/improved-plan", { sessionId });
  assert.equal(imp.status, 200);
  assert.ok(imp.json.improvedPlan.positioning);
  assert.equal(replies.length, 0);
  const imp2 = await post("/api/improved-plan", { sessionId });
  assert.equal(imp2.status, 200, "second ask is served from the stored result");

  // a new plan resets payment (answers changed => pay again)
  replies = [planReply];
  await post("/api/plan", { sessionId, intake: input.intake, followUps: [] });
  assert.equal((await post("/api/improved-plan", { sessionId })).status, 402);

  // unknown session, bad JSON, oversize
  assert.equal((await post("/api/unlock", { sessionId: "nope" })).status, 404);
  const bad = await fetch(base + "/api/plan", { method: "POST", body: "{not json" });
  assert.equal(bad.status, 400);
  const big = await post("/api/plan", { intake: { idea: "x".repeat(40_000) } });
  assert.equal(big.status, 413);

  // an AI failure becomes a 502 the page can show an error for
  replies = [];
  const fail = await post("/api/plan", { intake: input.intake, followUps: [] });
  assert.equal(fail.status, 502);

  // static files: pages served; code, notes and secrets are not
  assert.equal((await get("/")).status, 200);
  assert.equal((await get("/prototype/")).status, 200);
  for (const p of ["/idea.md", "/CLAUDE.md", "/server/index.ts", "/server/.env", "/.env", "/.git/config", "/prototype/../CLAUDE.md", "/%2e%2e/CLAUDE.md", "/server/package.json"]) {
    assert.equal((await get(p)).status, 404, `${p} must be 404`);
  }

  // AI off -> 503 so the page falls back to its scripted demo
  delete process.env.ANTHROPIC_API_KEY;
  assert.equal((await post("/api/plan", { intake: input.intake })).status, 503);
  assert.equal((await (await get("/api/health")).json()).ai, false);

  // Groq and Gemini adapters: request and reply mapping, with the network stubbed (no key, no cost)
  const realFetch = globalThis.fetch;
  try {
    const sent: any[] = [];
    process.env.GROQ_API_KEY = "gsk_test";
    globalThis.fetch = (async (url: any, init: any) => {
      sent.push({ url: String(url), body: JSON.parse(init.body), auth: init.headers.Authorization });
      return new Response(JSON.stringify({ choices: [{ message: { content: '{"ok":true}' }, finish_reason: "stop" }], usage: { prompt_tokens: 7, completion_tokens: 3 } }), { status: 200 });
    }) as typeof fetch;
    const g: any = await (groqClient.messages as any).create({ max_tokens: 99, system: "SYS", messages: [{ content: "hi" }], output_config: { format: { schema: { type: "object" } } } });
    assert.equal(sent[0].url, "https://api.groq.com/openai/v1/chat/completions");
    assert.equal(sent[0].auth, "Bearer gsk_test");
    assert.equal(sent[0].body.response_format.type, "json_object");
    assert.ok(sent[0].body.messages[0].content.includes("SYS") && sent[0].body.messages[0].content.includes('"type":"object"'));
    assert.equal(g.stop_reason, "end_turn");
    assert.equal(g.content[0].text, '{"ok":true}');
    assert.deepEqual(g.usage, { input_tokens: 7, output_tokens: 3 });
    globalThis.fetch = (async () => new Response(JSON.stringify({ error: { message: "Access denied" } }), { status: 403 })) as typeof fetch;
    await assert.rejects((groqClient.messages as any).create({ max_tokens: 9, messages: [{ content: "x" }] }), (e: any) => e.code === "config");
  } finally {
    globalThis.fetch = realFetch;
    delete process.env.GROQ_API_KEY;
  }

  console.log("server tests passed");
} finally {
  server.close();
  setClientForTests(null);
}
