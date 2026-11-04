// Lane D (Khaliq). Token and cost logging for every AI call (CLAUDE.md "Cost tracking").
// Each call prints one "[ai-cost]" line to the console. getCostSummary() gives the
// cost-per-person figure for the pitch deck's "Who pays" slide.

import { GBP_PER_USD, PRICES_USD_PER_MTOK, type CallName } from "./config.js";

export interface UsageLike {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
}

export interface CostRecord {
  at: string;
  call: CallName;
  /** Groups calls belonging to one person's plan, if the server passes one. */
  sessionId: string | null;
  model: string;
  inputTokens: number;
  /** Includes thinking tokens, which bill as output. */
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  costUSD: number | null;
  costGBP: number | null;
  durationMs: number;
}

const records: CostRecord[] = [];

export function costUSD(model: string, usage: UsageLike): number | null {
  const price = PRICES_USD_PER_MTOK[model];
  if (!price) return null; // unknown model: log tokens, leave cost blank rather than guess
  const cacheRead = usage.cache_read_input_tokens ?? 0;
  const cacheWrite = usage.cache_creation_input_tokens ?? 0;
  return (
    (usage.input_tokens * price.input +
      cacheRead * price.input * 0.1 +
      cacheWrite * price.input * 1.25 +
      usage.output_tokens * price.output) /
    1_000_000
  );
}

export function logUsage(
  call: CallName,
  model: string,
  usage: UsageLike,
  durationMs: number,
  sessionId: string | null,
): CostRecord {
  const usd = costUSD(model, usage);
  const record: CostRecord = {
    at: new Date().toISOString(),
    call,
    sessionId,
    model,
    inputTokens: usage.input_tokens,
    outputTokens: usage.output_tokens,
    cacheReadTokens: usage.cache_read_input_tokens ?? 0,
    cacheWriteTokens: usage.cache_creation_input_tokens ?? 0,
    costUSD: usd,
    costGBP: usd === null ? null : usd * GBP_PER_USD,
    durationMs,
  };
  records.push(record);
  const pence = record.costGBP === null ? "unknown" : `${(record.costGBP * 100).toFixed(2)}p`;
  console.log(
    `[ai-cost] ${call} model=${model} in=${record.inputTokens} out=${record.outputTokens} cost=${pence} time=${durationMs}ms` +
      (sessionId ? ` session=${sessionId}` : ""),
  );
  return record;
}

export function getCostLog(): readonly CostRecord[] {
  return records;
}

/** Totals since the server started, plus averages per session (one session = one person's plan). */
export function getCostSummary() {
  const sum = (rs: CostRecord[], f: (r: CostRecord) => number) => rs.reduce((a, r) => a + f(r), 0);
  const byCall: Record<string, { calls: number; inputTokens: number; outputTokens: number; costGBP: number }> = {};
  for (const r of records) {
    const b = (byCall[r.call] ??= { calls: 0, inputTokens: 0, outputTokens: 0, costGBP: 0 });
    b.calls += 1;
    b.inputTokens += r.inputTokens;
    b.outputTokens += r.outputTokens;
    b.costGBP += r.costGBP ?? 0;
  }
  const sessions = new Set(records.map((r) => r.sessionId).filter(Boolean));
  const totalGBP = sum(records, (r) => r.costGBP ?? 0);
  return {
    calls: records.length,
    totalGBP,
    byCall,
    sessions: sessions.size,
    averageGBPPerSession: sessions.size ? sum(records.filter((r) => r.sessionId), (r) => r.costGBP ?? 0) / sessions.size : null,
  };
}
