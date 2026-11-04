// Lane D (Khaliq). Safe JSON parsing of model replies (CLAUDE.md "AI output contract").
// Structured outputs should already give clean JSON; this is the safety net for when
// they are switched off or the model wraps its reply anyway.

import { AiError } from "./errors.js";

/** Removes a ```json ... ``` (or bare ```) wrapper if the whole reply is fenced. */
export function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```[a-zA-Z]*\s*\n?([\s\S]*?)\n?\s*```$/);
  return fenced ? fenced[1].trim() : trimmed;
}

/** The text from the first "{" to the last "}", for replies with chatter around the JSON. */
export function extractJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  return start !== -1 && end > start ? text.slice(start, end + 1) : null;
}

/** Parses a model reply into a value, trying progressively looser strategies. Never throws a SyntaxError. */
export function parseModelJson(text: string): unknown {
  const stripped = stripCodeFences(text);
  try {
    return JSON.parse(stripped);
  } catch {
    // fall through to the looser attempt
  }
  const extracted = extractJsonObject(stripped);
  if (extracted) {
    try {
      return JSON.parse(extracted);
    } catch {
      // fall through to the error
    }
  }
  throw new AiError("parse", `Model reply was not valid JSON (starts: ${JSON.stringify(text.slice(0, 80))})`);
}
