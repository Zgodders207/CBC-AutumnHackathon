// Lane D (Khaliq). Loads the prompt templates in prompts/ and fills their {{PLACEHOLDERS}}.

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AiError } from "./errors.js";

export type PromptName = "system" | "follow-up-questions" | "plan-call-1" | "full-plan-call-2";

// server/ai/ -> repo root -> prompts/. Override with PROMPTS_DIR if the server is bundled elsewhere.
const here = path.dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = process.env.PROMPTS_DIR || path.resolve(here, "../../prompts");

const cache = new Map<PromptName, string>();

export function loadPrompt(name: PromptName): string {
  let text = cache.get(name);
  if (text === undefined) {
    const file = path.join(PROMPTS_DIR, `${name}.md`);
    try {
      text = readFileSync(file, "utf8");
    } catch (cause) {
      throw new AiError("config", `Could not read prompt file ${file}`, { cause });
    }
    cache.set(name, text);
  }
  return text;
}

/**
 * JSON for dropping inside <tag>...</tag> in a prompt. "<" is escaped as <, which is
 * still valid JSON, so a user can't type "</user_answers>" to break out of the data block.
 */
export function promptJson(value: unknown): string {
  return JSON.stringify(value, null, 2).replace(/</g, "\\u003c");
}

/** Replaces every {{NAME}}. Throws if the template uses a name we didn't supply. */
export function fillPrompt(name: PromptName, vars: Record<string, string | number>): string {
  return loadPrompt(name).replace(/\{\{([A-Z0-9_]+)\}\}/g, (_match, key: string) => {
    if (!(key in vars)) throw new AiError("config", `Prompt ${name} needs {{${key}}} but it was not supplied`);
    return String(vars[key]);
  });
}
