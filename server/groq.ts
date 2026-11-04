// Lane E (George). Lets Khaliq's engine (server/ai/) run on Groq when GROQ_API_KEY is chosen.
// Same idea as gemini.ts: the engine only needs `client.messages.create(...)` to return an Anthropic-shaped reply,
// so this translates to Groq's OpenAI-style /chat/completions and back. No engine code touched, no new package.
// The key is read here on the server only and sent only to Groq, in a header.

import { AiError } from "./ai/errors.js";
import { setClientForTests, type MessagesClient } from "./ai/client.js";

const URL = "https://api.groq.com/openai/v1/chat/completions";
export const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b"; // check console.groq.com/docs/models if Groq has retired it
const RETRIES = 3; // waits 1, 2, 4 seconds

export const groqModel = () => process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL;
export const groqOn = () => Boolean(process.env.GROQ_API_KEY?.trim());

type Params = { max_tokens: number; system?: string; messages: { content: string }[]; output_config?: { format?: { schema?: unknown } } };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function create(p: Params, opts?: { timeout?: number }) {
  // JSON mode makes Groq return valid JSON but not our exact shape, so the schema goes into the prompt;
  // the engine still checks the reply itself.
  const schema = p.output_config?.format?.schema;
  const system = [p.system, "Reply with one JSON object only, no other text.", schema ? `It must match this JSON schema:\n${JSON.stringify(schema)}` : ""]
    .filter(Boolean).join("\n\n");
  const body = JSON.stringify({
    model: groqModel(),
    max_completion_tokens: p.max_tokens,
    response_format: { type: "json_object" },
    ...(groqModel().includes("gpt-oss") ? { reasoning_effort: "low" } : {}), // reasoning models spend max_completion_tokens thinking
    messages: [{ role: "system", content: system }, { role: "user", content: p.messages.map((m) => m.content).join("\n\n") }],
  });

  for (let attempt = 0; ; attempt++) {
    let res: Response;
    try {
      res = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY ?? ""}` },
        body,
        signal: AbortSignal.timeout(opts?.timeout ?? 90_000),
      });
    } catch (err) {
      if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")) throw new AiError("timeout", "groq: timed out", { cause: err });
      if (attempt < RETRIES) { await sleep(1000 * 2 ** attempt); continue; }
      throw new AiError("api", `groq: ${err instanceof Error ? err.message : String(err)}`, { cause: err });
    }
    const json: any = await res.json().catch(() => ({}));
    const msg: string = json?.error?.message ?? "";

    if (res.status === 429 || res.status >= 500) {
      const wait = Number(res.headers.get("retry-after")) || 0; // seconds; a long one means a daily limit, so don't burn retries
      if (attempt < RETRIES && wait <= 30) { await sleep(wait ? wait * 1000 : 1000 * 2 ** attempt); continue; }
      throw new AiError(res.status === 429 ? "rate_limit" : "api", `groq: ${res.status === 429 ? "rate limited" : `API error ${res.status}`} ${msg}`.trim());
    }
    // 403 "Access denied. Please check your network settings." is Groq blocking the network the server runs on (VPN / datacenter), not a bad key.
    if (res.status === 401 || res.status === 403) throw new AiError("config", `groq: access refused (${res.status}) ${msg}`.trim());
    if (res.status === 404 || res.status === 400) throw new AiError("config", `groq: request rejected (${res.status}), check GROQ_MODEL: ${msg}`);
    if (res.status !== 200) throw new AiError("api", `groq: API error ${res.status} ${msg}`);

    const choice = json.choices?.[0];
    return {
      stop_reason: choice?.finish_reason === "length" ? "max_tokens" : choice?.finish_reason === "content_filter" || !choice ? "refusal" : "end_turn",
      content: [{ type: "text", text: choice?.message?.content ?? "" }],
      usage: { input_tokens: json.usage?.prompt_tokens ?? 0, output_tokens: json.usage?.completion_tokens ?? 0 },
    };
  }
}

export const groqClient = { messages: { create } } as unknown as MessagesClient;

/** Point the engine at Groq. CLAUDE_MODEL is set so the cost log names the real model (cost shows "unknown", not a wrong price). */
export function useGroq(): void {
  process.env.CLAUDE_MODEL = groqModel();
  setClientForTests(groqClient);
}
