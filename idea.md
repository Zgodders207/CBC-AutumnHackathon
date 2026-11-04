# idea.md: design of the whole thing

Draft. Everything marked **TBD** is undecided and needs the team. Nothing here invents facts about local organisations, grants or figures.
This is the source of truth for the product. `CLAUDE.md` covers process and lanes; `PROJECT_BRIEF.md` covers the pitch and business case. If they disagree, tell the human and fix one of them.

## 1. Problem

People thinking of starting a business are often unsure whether it would last. They don't know if the idea, the way it makes money, or their own situation (budget, time) would hold up, and they usually find out only after spending money. Generic advice can make this worse (bad advice, false encouragement). People without a laptop, spare time or money are easy to ignore.

## 2. Users

- **Primary:** an aspiring founder in the North East who is unsure whether their business would be sustainable, likely on a phone, with limited budget and time.
- **Constraints we design for:** small budget, few hours a week, no laptop, no business background.
- **TBD:** the 1 to 2 personas we demo (fictional only, per the hackathon rule). Owner: Lane B.

## 3. Core idea

A **business planner** for people who are unsure about starting up. The user describes their idea, skills, budget and time available. The AI gives:

1. **A sustainability check:** an honest view of whether the business could last, with the reasons it might not.
2. **A round-up of what to improve** before they start, split into three parts: the **idea** (is there real demand?), the **business model** (how it makes money, and whether the numbers work) and **their own situation** (budget, time, skills).
3. **A roadmap** of cheap first steps to test it.

The free preview shows the sustainability check and a taste of the improvements; payment unlocks the full improvement list and roadmap.

Honest means: it says when the idea may not work, flags where to get professional advice, and prefers cheap ways to test before spending money. It never promises success.

## 4. User flow

1. **Intake:** questionnaire (idea, skills, budget, time per week). Mobile first.
2. **Generate:** the server calls the Anthropic API and returns one plan object as JSON (verdict, improvements, roadmap).
3. **Preview (free):** sustainability verdict and the main risks, plus a taste of what to improve.
4. **Unlock:** mocked paywall or Stripe test mode.
5. **Full plan:** the full improvement list (idea, business model, own situation) and the roadmap, with an export option.

States to design on every screen: loading, error, empty.

## 5. Features

Lane letters match `CLAUDE.md`.

| Feature | Lane | In the demo? |
|---|---|---|
| Idea questionnaire | A (Zac) | Yes |
| Verdict, improvements and roadmap screens, preview vs full | C (Michael) | Yes |
| Prompt, AI call, JSON parsing, cost logging | D (Khaliq) | Yes |
| Server routes, unlock/payment, fallback to demo data | E (George) | Yes |
| Paywall screen and pricing display | C (Michael) | Yes |
| Fictional personas, demo data, verified local facts | B (Eric) | Yes |
| Export (format **TBD**) | C (Michael) | TBD |
| Pitch deck, README, business case | A (Zac) | Yes |

Out of scope (YAGNI for a 3h45m build): accounts, saved history, real payments, real-time chat. **TBD:** confirm.

## 6. Screens

- Intake (multi-step or single page: **TBD**)
- Generating (loading, with staged progress)
- Verdict preview: sustainability verdict, main risks, a taste of improvements, paywall prompt
- Full plan: improvements (idea / business model / own situation) and the roadmap
- Error / fallback notice

Visual rules for all of these: `docs/design/DESIGN.md`.

## 7. Data model

The contract is `src/types/roadmap.ts`, owned by Lane D (Khaliq). This doc does not define it; it only lists what the plan needs to cover (section names **TBD**):

- Sustainability verdict, including reasons it may not work
- Improvements before starting, grouped as idea / business model / own situation
- Where to get professional advice (legal, tax, finance)
- Cheap tests to run first
- Steps that fit the stated budget and time
- Local support, only if verified
- A free-preview or paid flag on each section

Input to the AI: idea, skills, budget, time available.

## 8. AI design

- Model name comes from `CLAUDE_MODEL` in `.env`. The API key stays server-side.
- Output is **JSON only**. Lane D strips code fences and parses inside `try/catch`; Lane E's server falls back to a cached plan from `demo-data/` if anything fails, so the live demo never breaks.
- Prompt guardrails (scored):
  - honest viability, including reasons it may fail
  - flag professional advice
  - cheapest tests first
  - respect budget and time
  - no invented organisations, grants or figures
  - works on a phone screen
- Log input and output token counts per generation for the cost-to-serve figure.

## 9. Monetisation

Free preview, paid full plan. **TBD:** price and the exact preview/full split. Payments are mocked or Stripe **test mode** only.
The cost-to-serve figure comes from the token logging in section 8. Full business case: `PROJECT_BRIEF.md`.

## 10. Demo plan

- Runs live, end to end, on realistic but fictional input.
- A cached demo plan covers API failure.
- Demo script and speaker split: `PROJECT_BRIEF.md`.

## 11. Judging map

| Criterion | Weight | Where we show it |
|---|---|---|
| Technical quality | 40% | Working end-to-end flow, robust JSON handling and fallback |
| Real-world fit | 30% | Honest advice, budget/time aware, phone friendly |
| Investability | 15% | Token cost log, paid full plan |
| Go-to-market | 15% | First 100 customers plan in `PROJECT_BRIEF.md` (**TBD**) |

## 12. Open questions

1. Stack confirmation at 2:00pm.
2. Price and the preview/full split.
3. Export format.
4. Go-to-market story (first customer segment).
5. Whether to rename `src/types/roadmap.ts` now that it holds the whole plan (Lane D decides).
