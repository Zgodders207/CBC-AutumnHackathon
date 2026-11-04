// Lane D (Khaliq). Checks parsed model output against the contract and repairs what is
// safe to repair. Anything that can't be trusted throws AiError("invalid"), and Lane E's
// server falls back to demo data.
//
// Guardrails enforced in code here, not just asked for in the prompt:
//   - local support is limited to Lane B's verified list (no invented organisations)
//   - roadmap hours never exceed the person's stated weekly hours
//   - exactly 2 top risks, so the worst news is always in the free preview
//   - at most 5 questions per round, and no duplicate "Not sure" option

import {
  NOT_SURE,
  SCORE_KEYS,
  type BusinessType,
  type FollowUpQuestion,
  type ImprovedBusinessPlan,
  type Improvement,
  type LocalSupport,
  type PlanInput,
  type Range,
  type Risk,
  type RoadmapStep,
  type ScoreKey,
} from "../../src/types/roadmap.js";
import { MAX_QUESTIONS_PER_ROUND } from "./config.js";
import { AiError } from "./errors.js";

// ---------------------------------------------------------------------------
// Small readers. Each takes a path for clear error messages.
// ---------------------------------------------------------------------------

type Obj = Record<string, unknown>;

function fail(path: string, expected: string): never {
  throw new AiError("invalid", `AI output: ${path} should be ${expected}`);
}

function obj(v: unknown, path: string): Obj {
  if (typeof v !== "object" || v === null || Array.isArray(v)) fail(path, "an object");
  return v as Obj;
}

function str(v: unknown, path: string, { allowEmpty = false } = {}): string {
  if (typeof v !== "string") fail(path, "a string");
  const s = v.trim();
  if (!allowEmpty && s === "") fail(path, "a non-empty string");
  return s;
}

function arr(v: unknown, path: string): unknown[] {
  if (v === undefined || v === null) return []; // treat a missing list as empty
  if (!Array.isArray(v)) fail(path, "a list");
  return v;
}

function strList(v: unknown, path: string): string[] {
  return arr(v, path)
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter(Boolean);
}

function num(v: unknown, path: string): number {
  const n = typeof v === "string" ? Number(v) : v;
  if (typeof n !== "number" || !Number.isFinite(n)) fail(path, "a number");
  return n;
}

/** Whole, non-negative, min <= max. */
function range(v: unknown, path: string): Range {
  const o = obj(v, path);
  let min = Math.max(0, Math.round(num(o.min, `${path}.min`)));
  let max = Math.max(0, Math.round(num(o.max, `${path}.max`)));
  if (min > max) [min, max] = [max, min];
  return { min, max };
}

/** First number in free text like "about 6 hours" or "£300". Null for "Not sure" or no number. */
export function firstNumber(text: string): number | null {
  const m = text.replace(/,/g, "").match(/\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
}

// ---------------------------------------------------------------------------
// Follow-up questions
// ---------------------------------------------------------------------------

const BUSINESS_TYPES: BusinessType[] = ["retail", "saas", "services", "other"];

export interface ValidFollowUp {
  businessType: BusinessType;
  enough: boolean;
  questions: FollowUpQuestion[];
}

export function validateFollowUp(raw: unknown, round: number): ValidFollowUp {
  const o = obj(raw, "followUp");
  const businessType = BUSINESS_TYPES.includes(o.businessType as BusinessType) ? (o.businessType as BusinessType) : "other";
  let enough = o.enough === true;

  const seen = new Set<string>();
  const questions: FollowUpQuestion[] = enough
    ? []
    : arr(o.questions, "questions")
        .slice(0, MAX_QUESTIONS_PER_ROUND)
        .map((q, i) => {
          const qo = obj(q, `questions[${i}]`);
          // The app adds "Not sure" itself, so drop any the model added.
          const options = strList(qo.options, `questions[${i}].options`).filter(
            (opt) => opt.toLowerCase() !== NOT_SURE.toLowerCase(),
          );
          // A "choice" with fewer than 2 options can't be answered by tapping; make it free text.
          const isChoice = qo.type === "choice" && options.length >= 2;
          // Ids must be unique within a round; make one up if missing or repeated.
          let id = typeof qo.id === "string" && qo.id.trim() ? qo.id.trim() : `r${round}q${i + 1}`;
          if (seen.has(id)) id = `r${round}q${i + 1}`;
          seen.add(id);
          return {
            id,
            text: str(qo.text, `questions[${i}].text`),
            why: str(qo.why ?? "", `questions[${i}].why`, { allowEmpty: true }),
            type: isChoice ? "choice" : "text",
            options: isChoice ? options : [],
          };
        });

  // Nothing left to ask means we have enough.
  if (questions.length === 0) enough = true;
  return { businessType, enough, questions };
}

// ---------------------------------------------------------------------------
// Call 1: plan
// ---------------------------------------------------------------------------

export interface ValidPlan {
  summary: { idea: string; place: string; basedOn: string };
  scoreValues: Record<ScoreKey, number>;
  scoreReasons: Record<ScoreKey, string>;
  overallReason: string;
  topRisks: Risk[];
  otherRisks: Risk[];
  improvements: Record<ScoreKey, Improvement[]>;
  roadmap: RoadmapStep[];
  professionalAdvice: { topic: string; why: string; whoToAsk: string }[];
  localSupport: LocalSupport[];
  assumptions: string[];
  limits: string[];
}

function risk(v: unknown, path: string): Risk {
  const o = obj(v, path);
  return { title: str(o.title, `${path}.title`), detail: str(o.detail, `${path}.detail`) };
}

/** Keeps only entries that match Lane B's verified list by name, and copies the verified details over the model's. */
export function onlyVerified(raw: unknown, verified: LocalSupport[]): LocalSupport[] {
  const byName = new Map(verified.map((s) => [s.name.trim().toLowerCase(), s]));
  const out: LocalSupport[] = [];
  for (const item of arr(raw, "localSupport")) {
    if (typeof item !== "object" || item === null) continue;
    const name = (item as Obj).name;
    const match = typeof name === "string" ? byName.get(name.trim().toLowerCase()) : undefined;
    if (match && !out.includes(match)) out.push(match);
    else if (!match) console.warn(`[ai] dropped unverified local support: ${JSON.stringify(name)}`);
  }
  return out;
}

export function validatePlan(raw: unknown, input: PlanInput): ValidPlan {
  const o = obj(raw, "plan");

  const s = obj(o.summary, "summary");
  const summary = {
    idea: str(s.idea, "summary.idea"),
    place: str(s.place ?? "", "summary.place", { allowEmpty: true }) || input.intake.location || "North East",
    basedOn: str(s.basedOn ?? "", "summary.basedOn", { allowEmpty: true }),
  };

  const scores = obj(o.scores, "scores");
  const scoreValues = {} as Record<ScoreKey, number>;
  const scoreReasons = {} as Record<ScoreKey, string>;
  for (const key of SCORE_KEYS) {
    const sc = obj(scores[key], `scores.${key}`);
    scoreValues[key] = Math.min(100, Math.max(0, Math.round(num(sc.value, `scores.${key}.value`))));
    scoreReasons[key] = str(sc.reason, `scores.${key}.reason`);
  }

  // Exactly 2 top risks. If the model gave fewer, promote from otherRisks; extras move down.
  const allRisks = [
    ...arr(o.topRisks, "topRisks").map((r, i) => risk(r, `topRisks[${i}]`)),
    ...arr(o.otherRisks, "otherRisks").map((r, i) => risk(r, `otherRisks[${i}]`)),
  ];
  if (allRisks.length < 2) fail("topRisks", "2 risks");
  const topRisks = allRisks.slice(0, 2);
  const otherRisks = allRisks.slice(2, 6);

  const imp = obj(o.improvements, "improvements");
  const improvements = {} as Record<ScoreKey, Improvement[]>;
  for (const key of SCORE_KEYS) {
    improvements[key] = arr(imp[key], `improvements.${key}`).map((v, i) => {
      const io = obj(v, `improvements.${key}[${i}]`);
      return {
        title: str(io.title, `improvements.${key}[${i}].title`),
        why: str(io.why, `improvements.${key}[${i}].why`),
        cheapCheck: str(io.cheapCheck, `improvements.${key}[${i}].cheapCheck`),
      };
    });
  }

  // Guardrail: no step may ask for more hours than the person said they have.
  const statedHours = firstNumber(input.intake.hoursPerWeek);
  const roadmap = arr(o.roadmap, "roadmap")
    .slice(0, 6)
    .map((v, i): RoadmapStep => {
      const p = `roadmap[${i}]`;
      const so = obj(v, p);
      let hours = Math.max(0, Math.round(num(so.hoursPerWeek, `${p}.hoursPerWeek`)));
      if (statedHours !== null && hours > statedHours) hours = Math.floor(statedHours);
      return {
        title: str(so.title, `${p}.title`),
        firstStep: str(so.firstStep, `${p}.firstStep`),
        cheapTest: str(so.cheapTest, `${p}.cheapTest`),
        costGBP: range(so.costGBP, `${p}.costGBP`),
        weeks: range(so.weeks, `${p}.weeks`),
        hoursPerWeek: hours,
        goSignal: str(so.goSignal, `${p}.goSignal`),
      };
    });
  if (roadmap.length === 0) fail("roadmap", "at least 1 step");

  const professionalAdvice = arr(o.professionalAdvice, "professionalAdvice").map((v, i) => {
    const ao = obj(v, `professionalAdvice[${i}]`);
    return {
      topic: str(ao.topic, `professionalAdvice[${i}].topic`),
      why: str(ao.why, `professionalAdvice[${i}].why`),
      whoToAsk: str(ao.whoToAsk, `professionalAdvice[${i}].whoToAsk`),
    };
  });

  return {
    summary,
    scoreValues,
    scoreReasons,
    overallReason: str(o.overallReason, "overallReason"),
    topRisks,
    otherRisks,
    improvements,
    roadmap,
    professionalAdvice,
    localSupport: onlyVerified(o.localSupport, input.verifiedLocalSupport),
    assumptions: strList(o.assumptions, "assumptions"),
    limits: strList(o.limits, "limits"),
  };
}

// ---------------------------------------------------------------------------
// Call 2: improved business plan
// ---------------------------------------------------------------------------

export function validateImprovedPlan(raw: unknown): ImprovedBusinessPlan {
  const o = obj(raw, "improvedPlan");
  const titled = (v: unknown, p: string) => {
    const t = obj(v, p);
    return { title: str(t.title, `${p}.title`), detail: str(t.detail, `${p}.detail`) };
  };
  const costLine = (v: unknown, p: string) => {
    const c = obj(v, p);
    return { item: str(c.item, `${p}.item`), costGBP: range(c.costGBP, `${p}.costGBP`) };
  };

  const pos = obj(o.positioning, "positioning");
  const pricing = obj(o.pricing, "pricing");
  const money = obj(o.money, "money");

  return {
    positioning: {
      niche: str(pos.niche, "positioning.niche"),
      customer: str(pos.customer, "positioning.customer"),
      whyYou: str(pos.whyYou, "positioning.whyYou"),
    },
    offer: arr(o.offer, "offer").map((v, i) => titled(v, `offer[${i}]`)),
    pricing: { approach: str(pricing.approach, "pricing.approach"), working: str(pricing.working, "pricing.working") },
    findingCustomers: arr(o.findingCustomers, "findingCustomers").map((v, i) => {
      const f = obj(v, `findingCustomers[${i}]`);
      return {
        title: str(f.title, `findingCustomers[${i}].title`),
        firstAction: str(f.firstAction, `findingCustomers[${i}].firstAction`),
        costGBP: range(f.costGBP, `findingCustomers[${i}].costGBP`),
      };
    }),
    money: {
      startupCosts: arr(money.startupCosts, "money.startupCosts").map((v, i) => costLine(v, `money.startupCosts[${i}]`)),
      monthlyCosts: arr(money.monthlyCosts, "money.monthlyCosts").map((v, i) => costLine(v, `money.monthlyCosts[${i}]`)),
      breakEven: str(money.breakEven, "money.breakEven"),
    },
    runningIt: arr(o.runningIt, "runningIt").map((v, i) => titled(v, `runningIt[${i}]`)),
    milestones: arr(o.milestones, "milestones").map((v, i) => {
      const m = obj(v, `milestones[${i}]`);
      return { by: str(m.by, `milestones[${i}].by`), goal: str(m.goal, `milestones[${i}].goal`), measure: str(m.measure, `milestones[${i}].measure`) };
    }),
    mustBeTrue: strList(o.mustBeTrue, "mustBeTrue"),
    stopSignals: strList(o.stopSignals, "stopSignals"),
    risksAndResponses: arr(o.risksAndResponses, "risksAndResponses").map((v, i) => {
      const r = obj(v, `risksAndResponses[${i}]`);
      return { risk: str(r.risk, `risksAndResponses[${i}].risk`), response: str(r.response, `risksAndResponses[${i}].response`) };
    }),
  };
}
