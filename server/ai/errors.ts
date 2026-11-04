// Lane D (Khaliq). One error type for everything the AI engine can throw,
// so Lane E's routes can decide in one place whether to fall back to demo data.

export type AiErrorCode =
  | "config" // missing API key, bad model name, unfilled prompt placeholder
  | "timeout" // the API took too long
  | "rate_limit" // 429 after the SDK's retries
  | "api" // any other API or network failure
  | "refusal" // the model declined
  | "truncated" // hit max_tokens before finishing the JSON
  | "parse" // the reply was not JSON
  | "invalid"; // JSON, but not the shape we asked for

export class AiError extends Error {
  readonly code: AiErrorCode;
  /** Worth one more try before falling back to demo data. */
  readonly retryable: boolean;

  constructor(code: AiErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "AiError";
    this.code = code;
    this.retryable = code === "timeout" || code === "rate_limit" || code === "api" || code === "parse";
  }
}
