// Lane E (George). The web server: serves the prototype pages and the AI routes.
//
//   GET  /api/health         is the AI switched on? (the page falls back to its scripted demo if not)
//   POST /api/followups      one follow-up round of AI-written questions
//   POST /api/plan           call 1: free preview (ratings, 0-100 numbers, top 2 risks) - paid fields stay here
//   POST /api/unlock         MOCK payment: marks this session paid, returns the full call-1 plan
//   POST /api/improved-plan  call 2, only for a paid session
//
// The API key lives in .env and is only ever read by server/ai/. Paid fields are never sent before unlock,
// and the round cap, input limits and cost guards are enforced here (CLAUDE.md, Lane E).
// Run:  cd server && npm install && npm start      Test:  npm test

import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  NOT_SURE,
  SCORE_KEYS,
  type BusinessType,
  type FollowUpAnswer,
  type ImprovedBusinessPlan,
  type IntakeAnswers,
  type PlanInput,
  type ScoreKey,
  type ServerPlan,
} from "../src/types/roadmap.js";
import { AiError, generateFollowUpRound, generateImprovedPlan, generatePlan, toPreview, toUnlocked } from "./ai/index.js";
import { geminiModel, geminiOn, useGemini } from "./gemini.js";
import { groqModel, groqOn, useGroq } from "./groq.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAX_BODY_BYTES = 32 * 1024;
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

const intEnv = (name: string, fallback: number) => {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
};
// Read at request time so tests can change them. Hard ceiling of 3 matches the engine.
const maxRounds = () => Math.min(intEnv("MAX_ROUNDS", 1), 3);
const anthropicOn = () => Boolean(process.env.ANTHROPIC_API_KEY?.trim());
/** Which AI to use. AI_PROVIDER (anthropic | gemini | groq) picks one on purpose; otherwise the first key found, in that order. */
function provider(): "anthropic" | "gemini" | "groq" | null {
  const has = { anthropic: anthropicOn(), gemini: geminiOn(), groq: groqOn() };
  const want = process.env.AI_PROVIDER?.trim().toLowerCase() as keyof typeof has | undefined;
  if (want && want in has) return has[want] ? want : null;
  return has.anthropic ? "anthropic" : has.gemini ? "gemini" : has.groq ? "groq" : null;
}
const aiOn = () => provider() !== null;

class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = "bad_request",
  ) {
    super(message);
  }
}

// ---------------------------------------------------------------------------
// Sessions (in memory). One per person's plan. The browser only ever holds the id.
// ---------------------------------------------------------------------------

export interface Session {
  created: number;
  businessType: BusinessType;
  input?: PlanInput;
  plan?: ServerPlan;
  paid: boolean; // MOCK payment. Real payment (Stripe test mode) would set this from a webhook.
  improved?: ImprovedBusinessPlan;
}

/** Where sessions and rate-limit counters live. Memory by default; the Firebase function swaps in Firestore (functions/src/index.ts). */
export interface Store {
  load(id: string): Promise<Session | undefined>;
  save(id: string, s: Session): Promise<void>;
  /** Count one AI call for this address; returns calls this hour (this address) and today (everyone), including this one. */
  tick(ip: string): Promise<{ ipHour: number; day: number }>;
}

// ponytail: in-memory counters reset on restart and are per-process; the Firestore store is the multi-instance answer.
function memoryStore(): Store {
  const sessions = new Map<string, Session>();
  const hits = new Map<string, number[]>();
  let today = { date: "", calls: 0 };
  return {
    async load(id) {
      const now = Date.now();
      for (const [k, s] of sessions) if (now - s.created > SESSION_TTL_MS) sessions.delete(k);
      return sessions.get(id);
    },
    async save(id, s) {
      sessions.set(id, s);
    },
    async tick(ip) {
      const now = Date.now();
      const recent = (hits.get(ip) ?? []).filter((t) => now - t < 3_600_000);
      recent.push(now);
      hits.set(ip, recent);
      const date = new Date(now).toISOString().slice(0, 10);
      if (today.date !== date) today = { date, calls: 0 };
      today.calls++;
      return { ipHour: recent.length, day: today.calls };
    },
  };
}
let store: Store = memoryStore();
export const setStore = (s: Store) => {
  store = s;
};
// The improved plan is a paid AI call: share one in-flight call per session so a double click costs once.
const improving = new Map<string, Promise<ImprovedBusinessPlan>>();

async function getSession(id: unknown, create: boolean): Promise<[string, Session]> {
  const found = typeof id === "string" && /^[0-9a-f-]{36}$/.test(id) ? await store.load(id) : undefined;
  if (found && Date.now() - found.created <= SESSION_TTL_MS) return [id as string, found];
  if (!create) throw new HttpError(404, "That plan wasn't found. Start again.", "no_session");
  return [randomUUID(), { created: Date.now(), businessType: "other", paid: false }];
}

// ---------------------------------------------------------------------------
// Cost guards: every AI call costs real money, so cap how often one address (and the whole server) can call.
// ---------------------------------------------------------------------------

async function checkAiBudget(ip: string): Promise<void> {
  const { ipHour, day } = await store.tick(ip);
  if (ipHour > intEnv("AI_CALLS_PER_IP_PER_HOUR", 30)) {
    throw new HttpError(429, "You've used a lot of checks this hour. Try again later.", "rate_limit");
  }
  if (day > intEnv("AI_CALLS_PER_DAY", 300)) {
    throw new HttpError(503, "The checker is busy today. Try again tomorrow.", "daily_cap");
  }
}

// ---------------------------------------------------------------------------
// Input cleaning: never trust the browser. Everything is trimmed, capped and typed.
// ---------------------------------------------------------------------------

const str = (v: unknown, max = 1500): string => (typeof v === "string" ? v.trim().slice(0, max) : "");

function cleanIntake(v: unknown): IntakeAnswers {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const field = (k: string) => str(o[k]) || NOT_SURE;
  const idea = str(o.idea);
  if (!idea) throw new HttpError(400, "Describe your idea first.", "no_idea");
  return {
    idea,
    customer: field("customer"),
    howItMakesMoney: field("howItMakesMoney"),
    budget: field("budget"),
    hoursPerWeek: field("hoursPerWeek"),
    skills: field("skills"),
    stage: field("stage"),
    location: field("location"),
  };
}

function cleanFollowUps(v: unknown): FollowUpAnswer[] {
  if (!Array.isArray(v)) return [];
  const rows = v.slice(0, 15).map((x) => {
    const o = (x && typeof x === "object" ? x : {}) as Record<string, unknown>;
    return { round: Number(o.round) || 1, id: str(o.id, 40), question: str(o.question, 300), answer: str(o.answer, 1000) || NOT_SURE };
  });
  const clean = rows.filter((r) => r.id && r.question);
  if (clean.some((r) => r.round < 1 || r.round > maxRounds())) {
    throw new HttpError(400, "Too many question rounds.", "round_cap");
  }
  return clean;
}

/** The 0-100 numbers, read from the server-only data so the contract (Lane D) stays untouched. */
function numbersOf(sp: ServerPlan) {
  const scores = {} as Record<ScoreKey, number>;
  for (const k of SCORE_KEYS) scores[k] = Math.round(sp.internal.scoreValues[k]);
  return { overall: Math.round(sp.internal.overallValue), scores };
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

type Body = Record<string, unknown>;

async function route(pathname: string, body: Body, ip: string): Promise<unknown> {
  switch (pathname) {
    case "/api/followups": {
      const intake = cleanIntake(body.intake);
      const followUps = cleanFollowUps(body.followUps);
      const round = Number(body.round);
      if (!Number.isInteger(round) || round < 1 || round > maxRounds()) {
        throw new HttpError(400, "That round isn't allowed.", "round_cap");
      }
      const [id, session] = await getSession(body.sessionId, true);
      await checkAiBudget(ip);
      const result = await generateFollowUpRound({ intake, followUps, round, maxRounds: maxRounds() }, { sessionId: id });
      session.businessType = result.businessType; // server-only: the browser never sees it
      await store.save(id, session);
      return { sessionId: id, round: result.round };
    }

    case "/api/plan": {
      const intake = cleanIntake(body.intake);
      const followUps = cleanFollowUps(body.followUps);
      const [id, session] = await getSession(body.sessionId, true);
      await checkAiBudget(ip);
      // verifiedLocalSupport is empty until Lane B's verified list exists, so the AI names no organisations.
      const input: PlanInput = { intake, followUps, verifiedLocalSupport: [] };
      const plan = await generatePlan(input, { sessionId: id, businessType: session.businessType });
      // A new plan means new answers: payment and the improved plan start again, so nobody gets a free re-run.
      session.input = input;
      session.plan = plan;
      session.paid = false;
      session.improved = undefined;
      await store.save(id, session);
      return { sessionId: id, preview: toPreview(plan), numbers: numbersOf(plan) };
    }

    case "/api/unlock": {
      const [id, session] = await getSession(body.sessionId, false);
      if (!session.plan) throw new HttpError(409, "Check your idea first.", "no_plan");
      session.paid = true; // MOCK payment (test mode). Swap for a confirmed Stripe test-mode payment.
      await store.save(id, session);
      return { unlocked: toUnlocked(session.plan, null), numbers: numbersOf(session.plan) };
    }

    case "/api/improved-plan": {
      const [id, session] = await getSession(body.sessionId, false);
      if (!session.plan || !session.input) throw new HttpError(409, "Check your idea first.", "no_plan");
      if (!session.paid) throw new HttpError(402, "Unlock the full plan first.", "unpaid");
      if (!session.improved) {
        let call = improving.get(id);
        if (!call) {
          await checkAiBudget(ip);
          call = generateImprovedPlan(session.input, session.plan, { sessionId: id }).finally(() => improving.delete(id));
          improving.set(id, call);
        }
        session.improved = await call; // a failure throws here and leaves nothing saved, so one more try is allowed
        await store.save(id, session);
      }
      return { improvedPlan: session.improved };
    }

    default:
      throw new HttpError(404, "Not found.", "not_found");
  }
}

// ---------------------------------------------------------------------------
// Static pages: only the prototype, the root redirect and the design pages. Never server/, .env, *.md or .git.
// ---------------------------------------------------------------------------

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

function staticFile(urlPath: string): string | null {
  let p: string;
  try {
    p = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  if (p.endsWith("/")) p += "index.html";
  const rel = path.posix.normalize(p).replace(/^\/+/, "");
  if (rel.split("/").some((seg) => seg === ".." || seg.startsWith("."))) return null;
  const allowed = rel === "index.html" || rel.startsWith("prototype/") || rel.startsWith("docs/design/");
  if (!allowed || !TYPES[path.extname(rel)]) return null;
  const full = path.join(ROOT, rel);
  return full.startsWith(ROOT + path.sep) ? full : null;
}

// ---------------------------------------------------------------------------
// HTTP plumbing
// ---------------------------------------------------------------------------

function send(res: http.ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  res.end(JSON.stringify(body));
}

async function readJson(req: http.IncomingMessage): Promise<Body> {
  const chunks: Buffer[] = [];
  let size = 0;
  // Firebase Functions has already read the request and keeps the bytes on rawBody.
  const raw = (req as { rawBody?: Buffer }).rawBody;
  for await (const c of raw ? [raw] : req) {
    size += (c as Buffer).length;
    if (size > MAX_BODY_BYTES) throw new HttpError(413, "That's too much text.", "too_large");
    chunks.push(c as Buffer);
  }
  try {
    const v = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Body) : {};
  } catch {
    throw new HttpError(400, "That request wasn't valid.", "bad_json");
  }
}

/** Behind Cloud Run / Firebase the socket is Google's proxy; the caller is the first X-Forwarded-For entry. */
function clientIp(req: http.IncomingMessage): string {
  const fwd = process.env.K_SERVICE ? String(req.headers["x-forwarded-for"] ?? "").split(",")[0].trim() : "";
  return fwd || req.socket.remoteAddress || "unknown";
}

export function createApp(): http.Server {
  return http.createServer(async (req, res) => {
    const started = Date.now();
    const url = new URL(req.url ?? "/", "http://localhost");
    try {
      if (url.pathname === "/api/health" && req.method === "GET") {
        return send(res, 200, { ai: aiOn(), maxRounds: maxRounds(), payment: "mock" });
      }
      if (url.pathname.startsWith("/api/")) {
        if (req.method !== "POST") throw new HttpError(405, "Use POST.", "method");
        if (!aiOn()) throw new HttpError(503, "The AI isn't switched on here.", "ai_off");
        const out = await route(url.pathname, await readJson(req), clientIp(req));
        return send(res, 200, out);
      }
      if (req.method !== "GET" && req.method !== "HEAD") throw new HttpError(405, "Not allowed.", "method");
      const file = staticFile(url.pathname);
      if (!file) throw new HttpError(404, "Not found.", "not_found");
      const data = await readFile(file).catch(() => null);
      if (!data) throw new HttpError(404, "Not found.", "not_found");
      res.writeHead(200, { "Content-Type": TYPES[path.extname(file)], "X-Content-Type-Options": "nosniff" });
      res.end(req.method === "HEAD" ? undefined : data);
    } catch (err) {
      if (err instanceof HttpError) {
        send(res, err.status, { error: err.code, message: err.message });
      } else if (err instanceof AiError) {
        // The page shows its error screen, with an example plan on offer, so the demo never dead-ends.
        console.error(`[server] ${url.pathname} AI error ${err.code}: ${err.message}`);
        send(res, 502, { error: err.code, retryable: err.retryable, message: "The check didn't finish." });
      } else {
        console.error(`[server] ${url.pathname} unexpected error:`, err);
        send(res, 500, { error: "server", message: "Something went wrong." });
      }
    } finally {
      if (url.pathname.startsWith("/api/") && url.pathname !== "/api/health") {
        console.log(`[server] ${req.method} ${url.pathname} ${res.statusCode} ${Date.now() - started}ms`);
      }
    }
  });
}

/** Point the engine at the chosen non-Anthropic AI (if any) and say which one is on. The function calls this too. */
export function selectProvider() {
  const which = provider();
  if (which === "gemini") useGemini();
  if (which === "groq") useGroq();
  return which;
}

// Start only when run directly (npm start), not when imported by the test or the Firebase function.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = intEnv("PORT", 8787);
  // Local only by default: the key and the AI bill are behind this server. Set HOST to expose it on purpose.
  const host = process.env.HOST || "127.0.0.1";
  const which = selectProvider();
  createApp().listen(port, host, () => {
    console.log(`Groundworking server: http://${host}:${port}/prototype/`);
    console.log(
      which === "gemini" ? `AI on: Gemini (${geminiModel()}).`
      : which === "groq" ? `AI on: Groq (${groqModel()}).`
      : which === "anthropic" ? `AI on: Claude (${process.env.CLAUDE_MODEL || "engine default"}).`
      : "AI OFF: set a key in .env (ANTHROPIC_API_KEY, GEMINI_API_KEY or GROQ_API_KEY; AI_PROVIDER picks one). The page will run its scripted demo.",
    );
  });
}
