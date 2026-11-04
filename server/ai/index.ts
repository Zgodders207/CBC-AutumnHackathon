// Lane D (Khaliq). Public entry point of the AI engine. Lane E's routes import from here only.
//
//   generateFollowUpRound()  -> each follow-up round
//   generatePlan()           -> call 1, after the last round      (returns ServerPlan: server-only)
//   generateImprovedPlan()   -> call 2, only after payment
//   toPreview() / toUnlocked() -> the only shapes that may be sent to the browser
//
// Every function throws AiError on failure. Catch it in the route and serve demo data.

import {
  SCORE_KEYS,
  type BusinessType,
  type FollowUpAnswer,
  type FollowUpRound,
  type ImprovedBusinessPlan,
  type IntakeAnswers,
  type PlanInput,
  type PlanPreview,
  type ScoreKey,
  type ScoreResult,
  type ServerPlan,
  type UnlockedPlan,
} from "../../src/types/roadmap.js";
import { callClaudeJson } from "./client.js";
import { HARD_MAX_ROUNDS } from "./config.js";
import { AiError } from "./errors.js";
import { fillPrompt, loadPrompt, promptJson } from "./prompts.js";
import { followUpSchema, improvedPlanSchema, planSchema } from "./schemas.js";
import { combinedScore, ratingFromValue } from "./score.js";
import { validateFollowUp, validateImprovedPlan, validatePlan } from "./validate.js";

export { AiError, type AiErrorCode } from "./errors.js";
export { getCostLog, getCostSummary } from "./cost.js";
export { setClientForTests } from "./client.js";

export interface CallOptions {
  /** Any id that groups one person's calls, so the cost log can report cost per person. */
  sessionId?: string;
}

function checkIntake(intake: IntakeAnswers): void {
  if (!intake || typeof intake.idea !== "string" || intake.idea.trim() === "") {
    throw new AiError("config", "intake.idea is required");
  }
}

// ---------------------------------------------------------------------------
// Follow-up rounds
// ---------------------------------------------------------------------------

export interface FollowUpRequest {
  intake: IntakeAnswers;
  /** All follow-up answers so far, from every earlier round. [] for round 1. */
  followUps: FollowUpAnswer[];
  /** 1-based. */
  round: number;
  /** Stage 1: 1. Stage 2: up to 3. Never above 3. */
  maxRounds: number;
}

export interface FollowUpResult {
  /** Send this to the browser. */
  round: FollowUpRound;
  /** Server-only. Keep it with the session and pass it to generatePlan(). */
  businessType: BusinessType;
}

export async function generateFollowUpRound(req: FollowUpRequest, opts: CallOptions = {}): Promise<FollowUpResult> {
  checkIntake(req.intake);
  const maxRounds = Math.min(Math.max(1, Math.floor(req.maxRounds)), HARD_MAX_ROUNDS);
  if (!Number.isInteger(req.round) || req.round < 1 || req.round > maxRounds) {
    throw new AiError("config", `round must be between 1 and ${maxRounds}, got ${req.round}`);
  }

  const raw = await callClaudeJson({
    call: "followUp",
    system: loadPrompt("system"),
    user: fillPrompt("follow-up-questions", {
      ROUND_NUMBER: req.round,
      MAX_ROUNDS: maxRounds,
      INTAKE_ANSWERS_JSON: promptJson(req.intake),
      FOLLOW_UP_ANSWERS_JSON: promptJson(req.followUps ?? []),
    }),
    schema: followUpSchema,
    sessionId: opts.sessionId,
  });

  const valid = validateFollowUp(raw, req.round);
  return {
    round: { round: req.round, maxRounds, enough: valid.enough, questions: valid.questions },
    businessType: valid.businessType,
  };
}

// ---------------------------------------------------------------------------
// Call 1: plan
// ---------------------------------------------------------------------------

export async function generatePlan(
  input: PlanInput,
  opts: CallOptions & { businessType?: BusinessType } = {},
): Promise<ServerPlan> {
  checkIntake(input.intake);

  const raw = await callClaudeJson({
    call: "plan",
    system: loadPrompt("system"),
    user: fillPrompt("plan-call-1", {
      INTAKE_ANSWERS_JSON: promptJson(input.intake),
      FOLLOW_UP_ANSWERS_JSON: promptJson(input.followUps ?? []),
      VERIFIED_LOCAL_SUPPORT_JSON: promptJson(input.verifiedLocalSupport ?? []),
    }),
    schema: planSchema,
    sessionId: opts.sessionId,
  });

  const v = validatePlan(raw, input);

  // Numbers -> words. The overall uses George's formula, so one weak score holds it down.
  const scores = {} as Record<ScoreKey, ScoreResult>;
  for (const key of SCORE_KEYS) {
    scores[key] = { rating: ratingFromValue(v.scoreValues[key]), reason: v.scoreReasons[key] };
  }
  const overallValue = combinedScore(SCORE_KEYS.map((k) => v.scoreValues[k]));

  return {
    isExample: false,
    plan: {
      summary: v.summary,
      verdict: {
        overall: { rating: ratingFromValue(overallValue), reason: v.overallReason },
        scores,
        topRisks: v.topRisks,
      },
      otherRisks: v.otherRisks,
      improvements: v.improvements,
      roadmap: v.roadmap,
      professionalAdvice: v.professionalAdvice,
      localSupport: v.localSupport,
      assumptions: v.assumptions,
      limits: v.limits,
    },
    internal: {
      scoreValues: v.scoreValues,
      overallValue: Math.round(overallValue * 10) / 10,
      businessType: opts.businessType ?? "other",
    },
  };
}

// ---------------------------------------------------------------------------
// Call 2: improved business plan (paid only)
// ---------------------------------------------------------------------------

/** Call this only after payment is confirmed, so non-payers never cost these tokens. */
export async function generateImprovedPlan(
  input: PlanInput,
  serverPlan: ServerPlan,
  opts: CallOptions = {},
): Promise<ImprovedBusinessPlan> {
  checkIntake(input.intake);

  const raw = await callClaudeJson({
    call: "improvedPlan",
    system: loadPrompt("system"),
    user: fillPrompt("full-plan-call-2", {
      INTAKE_ANSWERS_JSON: promptJson(input.intake),
      FOLLOW_UP_ANSWERS_JSON: promptJson(input.followUps ?? []),
      // Words only; the model doesn't need our internal numbers.
      PLAN_CALL_1_JSON: promptJson(serverPlan.plan),
      VERIFIED_LOCAL_SUPPORT_JSON: promptJson(input.verifiedLocalSupport ?? []),
    }),
    schema: improvedPlanSchema,
    sessionId: opts.sessionId,
  });

  return validateImprovedPlan(raw);
}

// ---------------------------------------------------------------------------
// What may leave the server
// ---------------------------------------------------------------------------

/** The free preview. Paid fields are not hidden here - they are simply not included. */
export function toPreview(sp: ServerPlan): PlanPreview {
  const p = sp.plan;
  const improvementCounts = {} as Record<ScoreKey, number>;
  for (const key of SCORE_KEYS) improvementCounts[key] = p.improvements[key].length;
  return {
    access: "preview",
    isExample: sp.isExample,
    summary: p.summary,
    verdict: p.verdict,
    assumptions: p.assumptions,
    limits: p.limits,
    professionalAdvice: p.professionalAdvice,
    localSupport: p.localSupport,
    locked: {
      improvementCounts,
      roadmapSteps: p.roadmap.length,
      otherRisks: p.otherRisks.length,
      improvedPlan: true,
    },
  };
}

/** The full plan, after payment. Pass null for improvedPlan while call 2 is still running (or if it is dropped). */
export function toUnlocked(sp: ServerPlan, improvedPlan: ImprovedBusinessPlan | null): UnlockedPlan {
  return { ...sp.plan, access: "full", isExample: sp.isExample, improvedPlan };
}
