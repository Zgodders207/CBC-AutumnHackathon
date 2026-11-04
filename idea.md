# idea.md: design of the whole thing

Draft. Everything marked **TBD** is undecided and needs the team. Nothing here invents facts about local organisations, grants or figures.
Source of the starting facts: `CLAUDE.md`. If the two disagree, tell the human and fix one of them.

## 1. Problem

People thinking of starting a business are often unsure whether it would last. They don't know if the idea, the way it makes money, or their own situation (budget, time) would hold up, and they usually find out only after spending money. Generic advice can make this worse (bad advice, false encouragement). People without a laptop, spare time or money are easy to ignore.

## 2. Users

- **Primary:** an aspiring founder in the North East who is unsure whether their business would be sustainable, likely on a phone, with limited budget and time.
- **Constraints we design for:** small budget, few hours a week, no laptop, no business background.
- **TBD:** the 1 to 2 personas we demo (fictional only, per the hackathon rule).

## 3. Core idea

A **business planner** for people who are unsure about starting up. The user describes their idea, skills, budget and time available. The AI gives:

1. **A sustainability check:** an honest view of whether the business could last, with the reasons it might not.
2. **A round-up of what to improve** before they start, split into three parts: the **idea** (is there real demand?), the **business model** (how it makes money, and whether the numbers work) and **their own situation** (budget, time, skills).
3. **A roadmap** of cheap first steps to test it.

The free preview shows the sustainability check and a taste of the improvements; payment unlocks the full improvement list and roadmap.

Honest means: it says when the idea may not work, flags where to get professional advice, and prefers cheap ways to test before spending money. It never promises success.

## 4. User flow

1. **Intake:** questionnaire (idea, skills, budget, time per week). Mobile first.
2. **Generate:** the server calls the Anthropic API and returns roadmap JSON.
3. **Preview (free):** sustainability verdict and the main risks, plus a taste of what to improve.
4. **Unlock:** mocked paywall or Stripe test mode.
5. **Full plan:** the full improvement list (idea, business model, own situation) and the roadmap, with an export option.

States to design on every screen: loading, error, empty.

## 5. Features

| Feature | Lane | In the demo? |
|---|---|---|
| Idea questionnaire | A | Yes |
| Roadmap rendering, preview vs full | B | Yes |
| AI generation, JSON parsing, demo fallback, cost logging | C | Yes |
| Paywall / unlock | D | Yes |
| Export (format **TBD**) | B | TBD |
| Pitch deck, README, demo data | E | Yes |

Out of scope (YAGNI for a 3h45m build): accounts, saved history, real payments, real-time chat. **TBD:** confirm.

## 6. Screens

- Intake (multi-step or single page: **TBD**)
- Generating (loading)
- Roadmap preview, with the paywall prompt
- Full roadmap
- Error / fallback notice

## 7. Data model

The contract is `src/types/roadmap.ts`, owned by Lane C. This doc does not define it; it only lists what the roadmap needs to cover (section names **TBD**):

- Sustainability verdict, including reasons it may not work
- Improvements before starting, grouped as idea / business model / own situation
- Where to get professional advice (legal, tax, finance)
- Cheap tests to run first
- Steps that fit the stated budget and time
- Local support, only if verified

Input to the AI: idea, skills, budget, time available.

## 8. AI design

- Model name comes from `CLAUDE_MODEL` in `.env`. The API key stays server-side.
- Output is **JSON only**. The server strips code fences, parses inside `try/catch`, and falls back to a cached roadmap from `demo-data/` if anything fails, so the live demo never breaks.
- Prompt guardrails (scored):
  - honest viability, including reasons it may fail
  - flag professional advice
  - cheapest tests first
  - respect budget and time
  - no invented organisations, grants or figures
  - works on a phone screen
- Log input and output token counts per generation for the cost-to-serve figure.

## 9. Monetisation

Sell the roadmap: free preview, paid full version. **TBD:** price and what is behind the paywall (the exact preview/full split). Payments are mocked or Stripe **test mode** only.
The cost-to-serve figure comes from the token logging in section 8, for the "Who pays" slide.

## 10. Demo plan

- Runs live, end to end, on realistic but fictional input.
- A cached demo roadmap covers API failure.
- **TBD:** the demo script and who presents.

## 11. Judging map

| Criterion | Weight | Where we show it |
|---|---|---|
| Technical quality | 40% | Working end-to-end flow, robust JSON handling and fallback |
| Real-world fit | 30% | Honest advice, budget/time aware, phone friendly |
| Investability | 15% | Token cost log, paid roadmap |
| Go-to-market | 15% | **TBD** |

## 12. Open questions

1. Who owns each lane?
2. Stack confirmation at 2:00pm.
3. Price and the preview/full split.
4. Export format.
5. Go-to-market story.
