# server/ai/ - the AI engine

Owner: Lane D (Khaliq). Server-only. Lane E's routes import from `server/ai/index.ts` and nothing else.

## Setup

- Dependency: `@anthropic-ai/sdk` (Lane A to add to `package.json`; no other packages needed).
- `.env`: `ANTHROPIC_API_KEY=...` and `CLAUDE_MODEL=...` (defaults to `claude-opus-5-5`; idea.md 11c costs assume `claude-sonnet-5-5`).
- Optional: `PROMPTS_DIR` if the server runs from somewhere that can't see `prompts/`.
- The imports use `.js` endings (NodeNext style). They run as-is under `tsx`, Vite and `tsc`.

## Use from a route (Lane E)

```ts
import { generateFollowUpRound, generatePlan, generateImprovedPlan, toPreview, toUnlocked, AiError } from "./ai/index.js";

// Each follow-up round. Keep businessType in the session; send only `round` to the browser.
const { round, businessType } = await generateFollowUpRound({ intake, followUps, round: 1, maxRounds: 1 }, { sessionId });

// Call 1. Keep the ServerPlan on the server. Send toPreview(serverPlan) before payment.
const serverPlan = await generatePlan({ intake, followUps, verifiedLocalSupport }, { sessionId, businessType });
res.json(toPreview(serverPlan));

// After payment: send toUnlocked(serverPlan, null) straight away, then call 2.
const improved = await generateImprovedPlan({ intake, followUps, verifiedLocalSupport }, serverPlan, { sessionId });
res.json(toUnlocked(serverPlan, improved));

// Every function throws AiError. err.retryable says one more try is worth it; otherwise serve demo-data/.
```

`sessionId` is any id for one person's plan; it lets the cost log report the cost per person.

## What it guarantees

- **JSON only.** Structured outputs constrain the reply to a schema (`schemas.ts`). Code fences are stripped and parsing is in `try/catch` anyway (`parse.ts`). If the API rejects the schema, it retries without it.
- **Validated against the contract** (`validate.ts`), with these guardrails enforced in code:
  - local support only from Lane B's verified list, with the verified name and link (anything else is dropped and logged)
  - no roadmap step asks for more hours a week than the person said they have
  - exactly 2 top risks, so the worst news is always in the free preview
  - at most 5 questions a round, no duplicate "Not sure" option, round cap of 3
- **Words, not numbers.** The model scores each of the four areas 0 to 100. `score.ts` turns them into words (75+ Strong, 55+ Promising, 35+ Needs work, below that Not viable yet) and works out the overall rating with George's weighted-down formula (`score-algorithm.md`). The numbers stay in `ServerPlan.internal` and never reach the browser.
- **Paid content never leaves early.** `toPreview()` builds the preview from free fields only; it doesn't hide paid fields, it leaves them out.
- **Cost logging.** Every call prints `[ai-cost] call model in out cost time session`. `getCostSummary()` returns totals and the average cost per session for the pitch.

## Errors (`AiError.code`)

`config` (missing key, bad model, bad round) · `timeout` · `rate_limit` · `api` · `refusal` · `truncated` · `parse` · `invalid`. All should end in the demo-data fallback.

## Test

```bash
npx tsx server/ai/selftest.ts                          # offline, free: fake replies through the real engine
npx tsx --env-file=.env server/ai/try-live.ts          # live, a few pence: built-in fictional idea
npx tsx --env-file=.env server/ai/try-live.ts idea.json --paid   # live, your own fictional PlanInput, plus call 2
```
