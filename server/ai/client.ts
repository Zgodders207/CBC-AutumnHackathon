// Lane D (Khaliq). The single place that calls the Anthropic API. Server-only:
// the key is read from ANTHROPIC_API_KEY in .env and never reaches the browser.

import Anthropic from "@anthropic-ai/sdk";
import { CALL_SETTINGS, getModel, type CallName } from "./config.js";
import { logUsage } from "./cost.js";
import { AiError } from "./errors.js";
import { parseModelJson } from "./parse.js";

/** Only the part of the SDK client we use, so tests can pass a fake. */
export type MessagesClient = Pick<Anthropic, "messages">;

let client: MessagesClient | null = null;

function getClient(): MessagesClient {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new AiError("config", "ANTHROPIC_API_KEY is not set in .env");
    }
    client = new Anthropic({ maxRetries: 2 }); // retries 408/409/429/5xx and connection errors
  }
  return client;
}

/** For tests and offline demos only. Pass null to go back to the real client. */
export function setClientForTests(fake: MessagesClient | null): void {
  client = fake;
}

export interface CallJsonOptions {
  call: CallName;
  system: string;
  user: string;
  schema: Record<string, unknown>;
  sessionId?: string | null;
}

/**
 * Sends one request and returns the parsed JSON reply.
 *
 * Attempts, in order, moving on only if the API rejects the request shape (400):
 *   1. structured outputs + effort  (the API guarantees the JSON shape)
 *   2. effort only                  (in case the chosen model rejects the schema)
 *   3. plain request                (in case CLAUDE_MODEL is a model without effort)
 * Every attempt still gets code-fence stripping and try/catch parsing.
 */
export async function callClaudeJson(opts: CallJsonOptions): Promise<unknown> {
  const settings = CALL_SETTINGS[opts.call];
  const model = getModel();
  const base = {
    model,
    max_tokens: settings.maxTokens,
    system: opts.system,
    messages: [{ role: "user" as const, content: opts.user }],
  };
  const attempts = [
    { ...base, output_config: { effort: settings.effort, format: { type: "json_schema" as const, schema: opts.schema } } },
    { ...base, output_config: { effort: settings.effort } },
    base,
  ];

  const api = getClient();
  let lastBadRequest: unknown = null;

  for (const params of attempts) {
    const started = Date.now();
    let response: Anthropic.Message;
    try {
      response = await api.messages.create(params as Anthropic.MessageCreateParamsNonStreaming, {
        timeout: settings.timeoutMs,
      });
    } catch (err) {
      if (err instanceof Anthropic.BadRequestError) {
        console.warn(`[ai] ${opts.call}: API rejected request shape, trying a simpler one: ${err.message}`);
        lastBadRequest = err;
        continue;
      }
      throw toAiError(err, opts.call);
    }

    logUsage(opts.call, model, response.usage, Date.now() - started, opts.sessionId ?? null);

    if (response.stop_reason === "refusal") {
      throw new AiError("refusal", `${opts.call}: the model declined this request`);
    }
    if (response.stop_reason === "max_tokens") {
      throw new AiError("truncated", `${opts.call}: reply hit max_tokens (${settings.maxTokens}) before finishing`);
    }

    // With thinking on, content also holds thinking blocks; the answer is in the text blocks.
    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    return parseModelJson(text);
  }

  throw new AiError("config", `${opts.call}: every request shape was rejected (check CLAUDE_MODEL)`, {
    cause: lastBadRequest,
  });
}

/** Maps SDK errors to AiError codes, most specific first. */
function toAiError(err: unknown, call: CallName): AiError {
  if (err instanceof AiError) return err;
  if (err instanceof Anthropic.APIConnectionTimeoutError) return new AiError("timeout", `${call}: timed out`, { cause: err });
  if (err instanceof Anthropic.AuthenticationError) return new AiError("config", `${call}: API key rejected`, { cause: err });
  if (err instanceof Anthropic.PermissionDeniedError) return new AiError("config", `${call}: API key lacks permission`, { cause: err });
  if (err instanceof Anthropic.NotFoundError) return new AiError("config", `${call}: model not found (check CLAUDE_MODEL)`, { cause: err });
  if (err instanceof Anthropic.RateLimitError) return new AiError("rate_limit", `${call}: rate limited`, { cause: err });
  if (err instanceof Anthropic.APIError) return new AiError("api", `${call}: API error ${err.status ?? ""} ${err.message}`, { cause: err });
  return new AiError("api", `${call}: ${err instanceof Error ? err.message : String(err)}`, { cause: err });
}
