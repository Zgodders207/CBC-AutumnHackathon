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

## 11b. Decisions made (grilling session)

1. **Verdict:** a rating on three areas (Idea, Business model, Your situation) plus an overall rating, with the main reasons. Labelled "a rough view, not a prediction".
2. **Intake:** a short first round of quick questions, then the AI writes tailored follow-up questions from those answers. Up to **3 rounds**, with the AI deciding when it has enough.
3. **Safety net:** the server enforces a hard cap of 3 rounds and about 5 questions per round. If the API fails or times out, the app switches to a scripted demo conversation from `demo-data/` (fictional answers). The token log counts every round.
4. **Free preview:** overall rating, the three area ratings and the top 2 risks. Bad news is never hidden behind the paywall.
5. **Paid:** the detailed improvement list for each area, the roadmap of cheap first steps, and a **full improved business plan** (how to improve the business as a whole and make it the best it can be within its niche).
6. **Full plan is written only after payment, as a second AI call.** Non-payers never cost the extra tokens. Needs a good loading state (maybe 20 to 40 seconds) and a cached full plan in the demo fallback.

7. **Price:** £4.99 one-off per plan, mocked or Stripe test mode.
8. **Local support:** left for Eric (Research lane) to research. Until the team decides, the CLAUDE.md rule stands: never invent organisations, grants or figures. George's preference was for the AI to suggest local support freely; that conflicts with the rule and needs the team to agree and CLAUDE.md to change first.

## 11c. Rough costs (assumed, not measured; replace with the token log)

- About 3 question rounds plus 1 big call per person: roughly 10k tokens in, 4k out (assumed).
- Cost per person: cheap model about 3p, mid-range about 7p, top model about 35p. The full plan adds about 6p (mid-range), paid users only.
- Card fees about 1.5% + 20p (assumed). At a £4.99 price we keep about £4.72.
- Share of people who must pay to break even (£4.99, AI cost only): about 0.6% cheap, **1.5% mid-range**, 7.4% top model. With £20/month running costs: 2.3% at 500 people a month, 5.7% at 100 a month.
- Rule of thumb for free-to-paid conversion is 2% to 5% (not measured).
- Excludes anyone's time or wages.

## 11d. Investor mode (second audience)

The same tool also serves **investors and venture capitalists** who are weighing up a business they plan to put money into. One app, with a choice at the start: "I'm starting a business" or "I'm assessing a business to invest in".

**Input (decided):**
- The investor types in what they know: the pitch, the numbers, and answers they've gathered. The same short first round plus up to 3 AI follow-up rounds applies, reworded for an investor.
- The investor can also **upload a pitch deck or document** for the AI to read. **Flag:** this is a new feature (file upload and reading), and CLAUDE.md says new tools need the team's agreement in the group chat first. Not built until the team agrees. Fallback if not agreed: paste the deck's text into a box.

**Output (decided):**
- **Investment risk assessment:** ratings on areas such as market, business model, team and finances (exact areas **TBD**), an overall rating, the main red flags, and a list of questions to put to the founder.
- **A lean-invest / lean-pass view** with the reasons. **Flag:** this must never read as financial advice. It is worded as "this assessment leans towards / away from investing, and why", labelled a rough view and not a prediction, and always says to get professional, regulated advice before putting money in. It must not promise returns, and the AI must not invent figures, valuations or comparable deals.

**Pricing (decided: separate investor pricing):** investors pay a different price from the £4.99 founder price. The amount is **TBD**. The pitch can argue that investors are making bigger decisions, so a higher price is easier to justify. Needs a second price in the paywall and in the break-even maths.

**Data:** demo investor cases must use fictional businesses and fictional numbers (hackathon rule).

**Open questions for investor mode:**
1. Investor price, and whether it's per assessment or something else.
2. Does the upload make it into the hackathon build, or is it shown as a next step?
3. Which areas get rated (market, model, team, finances, others)?
4. Who owns the investor screens and prompts? This touches Lanes A (intake), C (verdict screens) and D (prompts).

## 12. Open questions

1. Who owns each lane?
2. Stack confirmation at 2:00pm.
3. Price and the preview/full split.
4. Export format.
5. Go-to-market story.
