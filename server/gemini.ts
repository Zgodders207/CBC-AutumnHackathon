// Lane E (George). Lets Khaliq's engine (server/ai/) run on Google Gemini when only GEMINI_API_KEY is set.
// The engine only needs `client.messages.create(...)` to return an Anthropic-shaped reply, so this adapter
// translates the request to Gemini's REST API and the reply back. No engine code is touched, no new package.
// The key is read here on the server only and sent only to Google, in a header (never in the URL).

import { AiError } from "./ai/errors.js";
import { setClientForTests, type MessagesClient } from "./ai/client.js";

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";
export const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";
const SAFETY_STOPS = new Set(["SAFETY", "PROHIBITED_CONTENT", "BLOCKLIST", "SPII", "RECITATION"]);

export const geminiModel = () => process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
export const geminiOn = () => Boolean(process.env.GEMINI_API_KEY?.trim());

type Params = {
  max_tokens: number;
  system?: string;
  messages: { content: string }[];
  output_config?: { effort?: string; format?: { schema?: unknown } };
};

async function callOnce(body: unknown, timeoutMs: number): Promise<{ status: number; json: any }> {
  const res = await fetch(`${BASE}/${geminiModel()}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY ?? "" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  return { status: res.status, json: await res.json().catch(() => ({})) };
}

const RETRIES = 4; // waits 1, 2, 4, 8 seconds
const sleep = (n: number) => new Promise((r) => setTimeout(r, 1000 * 2 ** n));

async function create(p: Params, opts?: { timeout?: number }) {
  const timeout = opts?.timeout ?? 90_000;
  const schema = p.output_config?.format?.schema;
  const build = (withSchema: boolean) => ({
    systemInstruction: p.system ? { parts: [{ text: p.system }] } : undefined,
    contents: [{ role: "user", parts: [{ text: p.messages.map((m) => m.content).join("\n\n") }] }],
    generationConfig: {
      maxOutputTokens: p.max_tokens,
      responseMimeType: "application/json",
      ...(p.output_config?.effort ? { thinkingConfig: { thinkingLevel: p.output_config.effort } } : {}), // engine's low/medium/high
      ...(withSchema && schema ? { responseJsonSchema: schema } : {}),
    },
  });

  let withSchema = true;
  for (let attempt = 0; ; attempt++) {
    let r;
    try {
      r = await callOnce(build(withSchema), timeout);
    } catch (err) {
      if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")) throw new AiError("timeout", "gemini: timed out", { cause: err });
      if (attempt < RETRIES) { await sleep(attempt); continue; } // network blip
      throw new AiError("api", `gemini: ${err instanceof Error ? err.message : String(err)}`, { cause: err });
    }
    const msg = r.json?.error?.message ?? "";
    if (r.status === 400 && withSchema && schema) { // Gemini disliked the schema: the engine still validates the reply itself
      console.warn(`[ai] gemini rejected the schema, retrying without it: ${msg}`);
      withSchema = false;
      continue;
    }
    // On 429 Google says how long to wait ("retryDelay": "23s"). A short wait is a per-minute limit: wait it out.
    // A long one (hours) is the free-tier daily quota: retrying only burns more of it, so fail straight away.
    const asked = Number(JSON.stringify(r.json?.error?.details ?? "").match(/"retryDelay":"([\d.]+)s"/)?.[1]);
    const quotaGone = r.status === 429 && asked > 30;
    if (quotaGone) console.warn(`[ai] gemini quota used up, resets in about ${Math.round(asked / 3600)}h: ${msg.split("\n")[1] ?? msg}`);
    if ((r.status === 429 || r.status >= 500) && attempt < RETRIES && !quotaGone) { // 503 "high demand" is common
      await (r.status === 429 && asked > 0 ? new Promise((res) => setTimeout(res, asked * 1000)) : sleep(attempt));
      continue;
    }
    if (r.status === 401 || r.status === 403) throw new AiError("config", `gemini: API key rejected (${msg})`);
    if (r.status === 404) throw new AiError("config", `gemini: model not found (check GEMINI_MODEL)`);
    if (r.status === 429) throw new AiError("rate_limit", "gemini: rate limited");
    if (r.status !== 200) throw new AiError("api", `gemini: API error ${r.status} ${msg}`);

    const cand = r.json.candidates?.[0];
    const finish: string = cand?.finishReason ?? (r.json.promptFeedback?.blockReason ? "SAFETY" : "STOP");
    const text = (cand?.content?.parts ?? []).filter((x: any) => typeof x.text === "string" && !x.thought).map((x: any) => x.text).join("");
    const u = r.json.usageMetadata ?? {};
    return {
      stop_reason: finish === "MAX_TOKENS" ? "max_tokens" : SAFETY_STOPS.has(finish) || !cand ? "refusal" : "end_turn",
      content: [{ type: "text", text }],
      usage: { input_tokens: u.promptTokenCount ?? 0, output_tokens: (u.candidatesTokenCount ?? 0) + (u.thoughtsTokenCount ?? 0) },
    };
  }
}

/** The engine's client seam (setClientForTests) is the only thing that needs to see this. */
export const geminiClient = { messages: { create } } as unknown as MessagesClient;

/** Point the engine at Gemini. CLAUDE_MODEL is set so the engine's cost log names the real model (cost shows "unknown", not a wrong price). */
export function useGemini(): void {
  process.env.CLAUDE_MODEL = geminiModel();
  setClientForTests(geminiClient);
}
