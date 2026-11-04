# TODO.md

Tick items as you finish them and push. Only edit your own lane's section, plus the shared checkpoints when you complete one. Add new tasks at the bottom of your lane. Lanes match `CLAUDE.md`.

## Shared checkpoints

- [ ] 2:00 Stack confirmed in CLAUDE.md
- [ ] 2:00 Skeleton pushed to `main`, everyone has cloned
- [ ] 2:00 `.env.example` committed; each person has a working `.env`
- [ ] 2:20 `src/types/roadmap.ts` contract pushed by Lane D and announced
- [ ] 3:30 Happy path works end to end: intake, generate, verdict preview, unlock, full plan
- [ ] 4:30 Feature freeze; bugs and polish only
- [ ] 5:15 Full demo rehearsal at 125% zoom on the demo machine
- [ ] 5:15 Phone check at 375px width
- [ ] 5:45 Repo public, deck and paragraph submitted

## Lane A: Zac (project manager / intake)

- [ ] Scaffold the skeleton (React + Vite + TypeScript + Tailwind, `server/` folder) and push
- [ ] Routing in `src/App.tsx`: landing, intake, generating, verdict preview, full plan
- [ ] Landing screen with the idea textarea as the hero (see `docs/design/DESIGN.md`)
- [ ] Intake steps: idea, skills, weekly hours, budget, location; "I'm not sure" option on each
- [ ] Labels, helper text, inline validation, focus on first error
- [ ] Send answers to Lane E's endpoint using the type in `src/types/roadmap.ts`
- [ ] README: problem, solution, how to run, how we used AI, known limitations
- [ ] Fill PROJECT_BRIEF.md slides 4 and 5 with real figures from Lanes B and D
- [ ] Pitch deck from the template and submission paragraph (confirm owner with the team)
- [ ] Merge lane branches into `main` every 30 minutes

## Lane B: Eric (research)

- [ ] One or two fictional demo personas in `demo-data/`
- [ ] Rough number of potential customers in the North East, with source
- [ ] "Why now" sentence, with source
- [ ] Verified local support facts only (name, what it offers, link), for the prompt and the demo
- [ ] Three realistic, fictional test ideas for Lane D to test the prompt
- [ ] Help Lane D build `demo-data/` cached plan for the fallback

## Lane C: Michael (UI design)

- [ ] Own and update `docs/design/DESIGN.md`; map its tokens into the Tailwind config
- [ ] Staged generating screen with real progress messages
- [ ] Verdict preview screen: verdict, reasons it may fail, main risks, taste of improvements
- [ ] Improvements screen: idea / business model / own situation
- [ ] Roadmap screen: route line with stops, locked stops for unpaid
- [ ] Paywall panel: what unlocks, price, one primary button
- [ ] Error / fallback notice with "Try again" and "See an example plan"
- [ ] Run the anti-slop checklist in DESIGN.md before each merge

## Lane D: Khaliq (AI and API usage)

- [ ] Define `src/types/roadmap.ts` first (verdict, improvements, roadmap, preview/paid flags) and announce it
- [ ] Decide whether to rename the contract file now it holds the whole plan
- [ ] Prompt in `prompts/`: JSON only, honest verdict, cheap tests, risks, limits, professional advice
- [ ] Prompt forbids invented organisations, grants and statistics
- [ ] Anthropic API call code with key from `.env` and model from `CLAUDE_MODEL`
- [ ] Strip code fences and parse inside `try/catch`
- [ ] Log input and output tokens per generation; give Zac the cost per plan
- [ ] Test with Lane B's three fictional ideas

## Lane E: George (backend flow)

- [ ] `server/` route that takes intake answers and calls Lane D's AI code
- [ ] Return preview fields only until unlocked; full plan after unlock
- [ ] Mock unlock or Stripe test mode
- [ ] Fallback to the cached plan in `demo-data/` on any API or parse failure
- [ ] `.env.example` with variable names only

## Decisions needed (team)

- [ ] Product name
- [ ] Price for the full plan
- [ ] Exact preview/full split
- [ ] Who owns the pitch deck (provisionally Zac)
- [ ] Who presents, and the speaker split
- [ ] First customer segment for slide 5
- [ ] Export format, or drop it
