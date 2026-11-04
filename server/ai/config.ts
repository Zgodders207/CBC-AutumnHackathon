// Lane D (Khaliq). Settings for the AI engine. Server-only.

/** Used when CLAUDE_MODEL is not set in .env. */
export const DEFAULT_MODEL = "claude-opus-5-5";

export function getModel(): string {
  return process.env.CLAUDE_MODEL?.trim() || DEFAULT_MODEL;
}

/** Hard caps (idea.md 11b item 3). Lane E's server enforces them too; this is defence in depth. */
export const HARD_MAX_ROUNDS = 3;
export const MAX_QUESTIONS_PER_ROUND = 5;

export type Effort = "low" | "medium" | "high";

export interface CallSettings {
  maxTokens: number;
  /** Thinking depth. Lower is faster and cheaper. */
  effort: Effort;
  /** Per attempt. The SDK retries twice on 429/5xx/connection errors. */
  timeoutMs: number;
}

/**
 * Per-call settings. Follow-up rounds must feel snappy, so they run at low effort.
 * Call 1 and call 2 do the real thinking. Raise effort if the plans read thin;
 * lower it if the demo feels slow.
 */
export const CALL_SETTINGS = {
  followUp: { maxTokens: 8000, effort: "low", timeoutMs: 45_000 },
  plan: { maxTokens: 16000, effort: "medium", timeoutMs: 90_000 },
  improvedPlan: { maxTokens: 16000, effort: "medium", timeoutMs: 90_000 },
} satisfies Record<string, CallSettings>;

export type CallName = keyof typeof CALL_SETTINGS;

/**
 * US dollars per million tokens (Anthropic pricing, as recorded in idea.md 11c on 4 Nov 2026).
 * Cache reads bill at 0.1x input, cache writes at 1.25x input.
 */
export const PRICES_USD_PER_MTOK: Record<string, { input: number; output: number }> = {
  "claude-opus-5-5": { input: 4, output: 20 },
  "claude-sonnet-5-5": { input: 2, output: 10 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5 },
};

/** Same rate as idea.md 11c. */
export const GBP_PER_USD = 0.74;
