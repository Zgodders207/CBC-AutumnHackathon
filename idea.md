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

A **business planner** for people who are unsure about starting up. The user describes their idea, skills, budget and time available, then answers a few tailored follow-up questions. The AI gives:

1. **A verdict:** a rating for each of three areas (idea, business model, your situation) plus an overall rating, with the main reasons. Always labelled "A rough view, not a prediction".
2. **Improvements** before they start, for each of the three areas.
3. **A roadmap** of cheap first steps to test it.
4. **A full improved business plan** (paid only): how to improve the business as a whole and make it the best it can be within its niche.

Honest means: it says when the idea may not work, flags where to get professional advice, and prefers cheap ways to test before spending money. It never promises success. **Bad news is never hidden behind the paywall.**

## 4. User flow

1. **Intake round 1:** a short set of quick questions (idea, skills, budget, time per week). Mobile first.
2. **Follow-up rounds:** the AI writes tailored questions from the answers so far, and decides when it has enough. See section 11b for the staged build.
3. **Generate (call 1):** the server calls the Anthropic API and returns the verdict, improvements and roadmap as JSON. Only the preview fields are sent to the browser before payment.
4. **Preview (free):** overall rating, the three area ratings and the top 2 risks.
5. **Unlock:** £4.99 one-off, mocked or Stripe test mode.
6. **Generate (call 2, paid only):** the full improved business plan is written after payment.
7. **Full plan:** improvements for each area, the roadmap and the full improved business plan, with an export option (**TBD**).

States to design on every screen: loading, error, empty.

## 5. Features

Lane letters match `CLAUDE.md`.

| Feature | Lane | In the demo? |
|---|---|---|
| Intake round 1 and follow-up question screens | A (Zac) | Yes |
| Verdict, improvements, roadmap and full plan screens, preview vs full | C (Michael) | Yes |
| Prompts for follow-up questions, call 1 and call 2; JSON parsing; cost logging | D (Khaliq) | Yes |
| Server routes, round cap, unlock/payment, fallback to demo data | E (George) | Yes |
| Paywall screen and pricing display | C (Michael) | Yes |
| Fictional personas, scripted demo conversation, verified local facts | B (Eric) | Yes |
| Export (format **TBD**) | C (Michael) | TBD |
| Pitch deck, README, business case | A (Zac) | Yes |

Out of scope (YAGNI for a 3h45m build): accounts, saved history, real payments, real-time chat. **TBD:** confirm.

## 6. Screens

- Intake round 1
- Follow-up questions (one round per screen, with "Round 2 of up to 3")
- Generating (staged progress)
- Verdict preview: overall and area ratings, top 2 risks, paywall prompt
- Writing your full plan (paid; may take 20 to 40 seconds, needs a good loading state)
- Full plan: improvements, roadmap, full improved business plan
- Error / fallback notice

Visual rules for all of these: `docs/design/DESIGN.md`.

## 7. Data model

The contract is `src/types/roadmap.ts`, owned by Lane D (Khaliq). This doc does not define it; it only lists what it needs to cover (field names **TBD**):

- Follow-up questions: a round of up to about 5 questions, plus a flag saying whether the AI has enough
- Verdict: overall rating and three area ratings, each a **word label** (see 11b), plus the main reasons and the top risks
- Improvements, grouped as idea / business model / your situation
- Where to get professional advice (legal, tax, finance)
- Roadmap of cheap tests that fit the stated budget and time
- Full improved business plan (call 2 only)
- Local support, only from Lane B's verified list
- A free-preview or paid flag on each section

Input to the AI: idea, skills, budget, time available, and all follow-up answers.

## 8. AI design

- Model name comes from `CLAUDE_MODEL` in `.env`. The API key stays server-side.
- Output is **JSON only**. Lane D strips code fences and parses inside `try/catch`; Lane E's server falls back to cached data from `demo-data/` if anything fails, so the live demo never breaks.
- Paid fields from call 1 never reach the browser before unlock (they would be visible in developer tools).
- Prompt guardrails (scored):
  - honest viability, including reasons it may fail
  - flag professional advice
  - cheapest tests first
  - respect budget and time
  - no invented organisations, grants or figures
  - works on a phone screen
- Log input and output token counts for every call, including each question round, for the cost-to-serve figure.

## 9. Monetisation

Free preview (all ratings and the top 2 risks), paid full plan at **£4.99 one-off**. Payments are mocked or Stripe **test mode** only.
Full plan is generated only after payment, so non-payers never cost the extra tokens. Costs: section 11c. Full business case: `PROJECT_BRIEF.md`.

## 10. Demo plan

- Runs live, end to end, on realistic but fictional input.
- Cached data covers API failure: a scripted demo conversation, a cached verdict and a cached full plan.
- Demo script and speaker split: `PROJECT_BRIEF.md`.

## 11. Judging map

| Criterion | Weight | Where we show it |
|---|---|---|
| Technical quality | 40% | Adaptive follow-up questions, robust JSON handling, round cap, fallback, paid fields kept server-side |
| Real-world fit | 30% | Honest advice, bad news always free, budget/time aware, phone friendly |
| Investability | 15% | Measured token cost, second call only for payers, £4.99 price |
| Go-to-market | 15% | First 100 customers plan in `PROJECT_BRIEF.md` (**TBD**) |

## 11b. Decisions made (grilling session, George; accepted by Zac as PM on merge, team to confirm in the group chat)

1. **Verdict:** a rating on three areas (idea, business model, your situation) plus an overall rating, with the main reasons. Labelled "A rough view, not a prediction". **Ratings are words, never numbers or percentages.** Proposed labels, editable by Lanes C and D: Strong / Promising / Needs work / Not viable yet.
2. **Intake:** a short first round of quick questions, then the AI writes tailored follow-up questions from those answers, deciding when it has enough. **Built in stages to protect the 3:30 checkpoint:**
   - Stage 1 (must work by 3:30): round 1 plus **one** AI follow-up round, then generate.
   - Stage 2 (only once the full happy path works): allow up to 3 rounds.
3. **Safety net:** the server enforces a hard cap of 3 rounds and about 5 questions per round. If the API fails or times out, the app switches to a scripted demo conversation from `demo-data/` (fictional answers). The token log counts every round.
4. **Free preview:** overall rating, the three area ratings and the top 2 risks. Bad news is never hidden behind the paywall.
5. **Paid:** the detailed improvements for each area, the roadmap of cheap first steps, and a **full improved business plan**.
6. **The full improved business plan is written only after payment, as a second AI call.** Non-payers never cost the extra tokens. Needs a good loading state (possibly 20 to 40 seconds) and a cached full plan in the demo fallback. **If behind schedule at 4:30, drop call 2 and keep improvements plus roadmap as the paid content.**
7. **Price:** £4.99 one-off per plan, mocked or Stripe test mode.
8. **Local support:** the CLAUDE.md rule stands: never invent organisations, grants or figures. The AI may only mention local support that Lane B (Eric) has verified and placed in `demo-data/`, passed into the prompt. Anything wider needs the team to agree and CLAUDE.md to change first.

## 11c. Rough costs (assumed token counts; replace with the token log)

Prices checked against Anthropic's official pricing page on 4 November 2026: Haiku 5.5 $0.10 / $0.50, Sonnet 5.5 $2 / $10, Opus 5.5 $4 / $20 per million input / output tokens. Converted at about £0.74 per $1.

- **Assumed usage:** about 3 question rounds plus 1 big call per person, roughly 10k tokens in and 4k out. Claude 4.7 and later models use a tokenizer that produces about 30% more tokens for the same text, so the real log may come in higher.
- **Cost per person (call 1 and question rounds):** Haiku 5.5 about 0.2p, **Sonnet 5.5 about 4.4p**, Opus 5.5 about 8.9p.
- **Call 2 (paid users only):** about 4p on Sonnet 5.5 (assumed size).
- **Card fees:** Stripe's standard UK card rate is 1.5% + 20p (premium and international cards cost more). At £4.99 we keep about £4.72 per sale.
- **Share of people who must pay to break even (AI cost only, Sonnet 5.5):** about 0.9%. With £20 a month running costs: about 1.8% at 500 people a month, about 5.2% at 100 a month.
- Rule of thumb for free-to-paid conversion is 2% to 5% (not measured; Lane B to source if quoted in the pitch).
- Excludes anyone's time or wages, and VAT.

## 12. Open questions

1. Stack confirmation at 2:00pm.
2. Team confirmation of the 11b decisions.
3. Final rating labels.
4. Export format, or drop it.
5. Go-to-market story (first customer segment).
6. Whether to rename `src/types/roadmap.ts` now that it holds the whole plan (Lane D decides).
