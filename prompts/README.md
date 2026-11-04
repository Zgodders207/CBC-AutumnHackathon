# prompts/

Owner: Lane D (Khaliq). Ask before editing. Loaded and filled by `server/ai/prompts.ts`.

| File | Sent as | Call | Returns |
|------|---------|------|---------|
| `system.md` | `system`, every call | all | shared rules: honesty, budget and time, no invented facts, professional advice, plain phone-length writing, input safety, JSON only |
| `follow-up-questions.md` | user message | each follow-up round | silent business type, `enough`, up to 5 questions |
| `plan-call-1.md` | user message | call 1 | four 0-100 scores with reasons, top 2 risks, improvements per score, roadmap, advice, local support, assumptions, limits |
| `full-plan-call-2.md` | user message | call 2, after payment only | the improved business plan |

## Placeholders

| Placeholder | Used in | Value |
|-------------|---------|-------|
| `{{INTAKE_ANSWERS_JSON}}` | all | `IntakeAnswers` from `src/types/roadmap.ts` |
| `{{FOLLOW_UP_ANSWERS_JSON}}` | all | `FollowUpAnswer[]`, `[]` before round 1 |
| `{{ROUND_NUMBER}}`, `{{MAX_ROUNDS}}` | follow-up | 1-based round, cap (1 in stage 1, up to 3 in stage 2) |
| `{{VERIFIED_LOCAL_SUPPORT_JSON}}` | call 1, call 2 | Lane B's verified list, `[]` if none |
| `{{PLAN_CALL_1_JSON}}` | call 2 | the call 1 plan (words only, no internal numbers) |

Data is inserted with `<` escaped, so typed text can't close a tag like `</user_answers>`.

## If you change a prompt

- The JSON shape in a prompt must match `server/ai/schemas.ts` and `src/types/roadmap.ts`. Change all three together and run `npx tsx server/ai/selftest.ts`.
- The score bands in `plan-call-1.md` must match `RATING_BANDS` in `server/ai/score.ts`.
