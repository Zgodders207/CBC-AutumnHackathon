/**
 * THE CONTRACT between lanes. Owner: Lane D (Khaliq). Nobody else edits it.
 * Changes are announced in the group chat before pushing.
 *
 * Kept as `roadmap.ts` (not renamed) so every doc that points here stays right,
 * even though it now holds the whole plan.
 *
 * Who uses what:
 *   Lane A (intake screens)      IntakeAnswers, FollowUpRound, FollowUpAnswer, NOT_SURE
 *   Lane C (score/plan screens)  PlanPreview, UnlockedPlan, SCORE_KEYS, SCORE_LABELS, RATINGS
 *   Lane D (AI engine)           everything; server/ai/ produces these
 *   Lane E (server routes)       PlanInput, ServerPlan, toPreview() in server/ai/
 *
 * RULE: the browser only ever receives PlanPreview (before payment) or
 * UnlockedPlan (after payment). ServerPlan holds numeric score values and the
 * business type; it must never be sent to the browser.
 */

// ---------------------------------------------------------------------------
// Shared vocabulary
// ---------------------------------------------------------------------------

/** The exact answer string for "Not sure". Every question allows it. */
export const NOT_SURE = "Not sure";

/** Word ratings, worst to best. Ratings are words, never numbers (idea.md 11b). */
export const RATINGS = ["Not viable yet", "Needs work", "Promising", "Strong"] as const;
export type Rating = (typeof RATINGS)[number];

/** The four scores, in display order (DESIGN.md "The verdict: four scores"). */
export const SCORE_KEYS = [
  "financialStability",
  "longTermSustainability",
  "roomInMarket",
  "skillsAndAbility",
] as const;
export type ScoreKey = (typeof SCORE_KEYS)[number];

/** On-screen names. Higher is always better, so it's "Room in the market", never "Saturation". */
export const SCORE_LABELS: Record<ScoreKey, string> = {
  financialStability: "Financial stability",
  longTermSustainability: "Long-term sustainability",
  roomInMarket: "Room in the market",
  skillsAndAbility: "Skills and ability",
};

/** Shown with every verdict. */
export const VERDICT_DISCLAIMER = "A rough view, not a prediction";

/** Decided silently after round 1; steers follow-up questions only. Never shown to the person. */
export type BusinessType = "retail" | "saas" | "services" | "other";

/** A rough range in whole pounds or whole weeks. */
export interface Range {
  min: number;
  max: number;
}

// ---------------------------------------------------------------------------
// Intake (Lane A sends these)
// ---------------------------------------------------------------------------

/**
 * Round 1 answers. Every value is the person's answer as text, or NOT_SURE.
 * Free text is fine ("about £300", "evenings only") - the AI reads it as written.
 */
export interface IntakeAnswers {
  /** What the business is, in their words. Required. */
  idea: string;
  /** Who it's for. */
  customer: string;
  /** How it makes money. */
  howItMakesMoney: string;
  /** Start-up budget, e.g. "£300". */
  budget: string;
  /** Hours a week they can give it, e.g. "6". */
  hoursPerWeek: string;
  /** Relevant skills. */
  skills: string;
  /** "Just an idea", "Tested it", "Already trading" or NOT_SURE. */
  stage: string;
  /** Town or area, e.g. "Gateshead". */
  location: string;
}

/** One question the AI wrote. Lane A adds the NOT_SURE option to every question. */
export interface FollowUpQuestion {
  id: string;
  text: string;
  /** Helper text under the question ("why we ask"). */
  why: string;
  type: "text" | "choice";
  /** Tap answers for "choice"; [] for "text". */
  options: string[];
}

/** What the browser gets for each follow-up round. */
export interface FollowUpRound {
  /** 1-based follow-up round number (round 1 = first AI round, after intake). How it's labelled on screen is Lane A's call. */
  round: number;
  maxRounds: number;
  /** True when the AI has enough to generate; questions is then []. */
  enough: boolean;
  questions: FollowUpQuestion[];
}

/** One answered follow-up question, sent back on every later call. */
export interface FollowUpAnswer {
  round: number;
  id: string;
  question: string;
  /** The answer as text, or NOT_SURE. */
  answer: string;
}

/** Verified local support from Lane B's list in demo-data/. Passed into the prompt as-is. */
export interface LocalSupport {
  name: string;
  whatItOffers: string;
  link: string;
}

/** Everything the AI needs to generate a plan. Built by Lane E's server. */
export interface PlanInput {
  intake: IntakeAnswers;
  followUps: FollowUpAnswer[];
  /** Lane B's verified list. [] if none - the AI then mentions no organisations. */
  verifiedLocalSupport: LocalSupport[];
}

// ---------------------------------------------------------------------------
// Call 1: verdict, improvements, roadmap
// ---------------------------------------------------------------------------

export interface ScoreResult {
  rating: Rating;
  /** One line under the score. */
  reason: string;
}

export interface Risk {
  title: string;
  detail: string;
}

export interface Improvement {
  /** What to change. */
  title: string;
  why: string;
  /** "Check it cheaply:" line. */
  cheapCheck: string;
}

/** One stop on the roadmap route. */
export interface RoadmapStep {
  title: string;
  firstStep: string;
  cheapTest: string;
  costGBP: Range;
  weeks: Range;
  hoursPerWeek: number;
  /** The result that means it's worth moving to the next step. */
  goSignal: string;
}

export interface ProfessionalAdvice {
  topic: string;
  why: string;
  /** A kind of adviser ("an accountant"), never a named organisation. */
  whoToAsk: string;
}

export interface PlanSummary {
  /** The business in one plain sentence. */
  idea: string;
  /** Town or area, for "Your plan: [idea], [place]". */
  place: string;
  /** e.g. "Based on 6 hours a week and a £300 budget." */
  basedOn: string;
}

export interface Verdict {
  overall: ScoreResult;
  scores: Record<ScoreKey, ScoreResult>;
  /** Always exactly 2. Always free. */
  topRisks: Risk[];
}

/** Which sections are free and which need payment. Lane E enforces this with toPreview(). */
export const SECTION_ACCESS = {
  summary: "free",
  verdict: "free",
  assumptions: "free",
  limits: "free", // "What it can't know" on the score page
  professionalAdvice: "free", // "When to get proper advice" on the score page
  localSupport: "free",
  otherRisks: "paid",
  improvements: "paid",
  roadmap: "paid",
  improvedPlan: "paid",
} as const;
export type Access = "free" | "paid";

/** The free preview: everything the score page needs, and nothing paid. */
export interface PlanPreview {
  access: "preview";
  /** True when this came from cached demo data, so the UI shows "Example with fictional answers". */
  isExample: boolean;
  summary: PlanSummary;
  verdict: Verdict;
  assumptions: string[];
  limits: string[];
  professionalAdvice: ProfessionalAdvice[];
  localSupport: LocalSupport[];
  /** What unlocks, so the paywall can say exactly what you get without showing it. */
  locked: {
    improvementCounts: Record<ScoreKey, number>;
    roadmapSteps: number;
    otherRisks: number;
    improvedPlan: true;
  };
}

/** The whole call 1 result as the browser sees it after payment. No numbers in ratings. */
export interface Plan {
  summary: PlanSummary;
  verdict: Verdict;
  otherRisks: Risk[];
  improvements: Record<ScoreKey, Improvement[]>;
  roadmap: RoadmapStep[];
  professionalAdvice: ProfessionalAdvice[];
  localSupport: LocalSupport[];
  assumptions: string[];
  limits: string[];
}

/**
 * Server-only. The plan plus internal numbers used to work out ratings.
 * NEVER send this to the browser - use toPreview() or toUnlocked().
 */
export interface ServerPlan {
  plan: Plan;
  isExample: boolean;
  internal: {
    /** 0-100 per score, from the model. Converted to words with ratingFromValue(). */
    scoreValues: Record<ScoreKey, number>;
    /** Combined with George's weighted-down formula (score-algorithm.md). */
    overallValue: number;
    businessType: BusinessType;
  };
}

// ---------------------------------------------------------------------------
// Call 2: improved business plan (paid only)
// ---------------------------------------------------------------------------

export interface TitledDetail {
  title: string;
  detail: string;
}

export interface CostLine {
  item: string;
  costGBP: Range;
}

export interface ImprovedBusinessPlan {
  positioning: {
    niche: string;
    customer: string;
    whyYou: string;
  };
  offer: TitledDetail[];
  pricing: {
    approach: string;
    /** The sum in plain words, assumptions marked "(assumed)". */
    working: string;
  };
  findingCustomers: { title: string; firstAction: string; costGBP: Range }[];
  money: {
    startupCosts: CostLine[];
    monthlyCosts: CostLine[];
    breakEven: string;
  };
  runningIt: TitledDetail[];
  milestones: { by: string; goal: string; measure: string }[];
  mustBeTrue: string[];
  stopSignals: string[];
  risksAndResponses: { risk: string; response: string }[];
}

/** What the browser gets after payment. improvedPlan is null while call 2 is still writing (or if call 2 was dropped). */
export interface UnlockedPlan extends Plan {
  access: "full";
  isExample: boolean;
  improvedPlan: ImprovedBusinessPlan | null;
}
