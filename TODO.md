# TODO.md

Tick items as you finish them and push. Only edit your own lane's section, plus the shared checkpoints when you complete one. Add new tasks at the bottom of your lane. Lanes match `CLAUDE.md`; product decisions are in `idea.md` section 11b.

## Shared checkpoints

- [ ] 2:00 Stack confirmed in CLAUDE.md
- [ ] 2:00 Skeleton pushed to `main`, everyone has cloned
- [ ] 2:00 `.env.example` committed; each person has a working `.env`
- [ ] 2:20 `src/types/roadmap.ts` contract pushed by Lane D and announced
- [ ] 2:20 Team confirms the idea.md 11b decisions in the group chat
- [ ] 3:30 Stage 1 happy path works end to end: round 1, one follow-up round, verdict preview, unlock, full plan
- [ ] 3:30 Decide: add up to 3 follow-up rounds (stage 2) only if the happy path works
- [ ] 4:30 Feature freeze; bugs and polish only. If call 2 is not working, drop it
- [ ] 5:15 Full demo rehearsal at 125% zoom on the demo machine
- [ ] 5:15 Phone check at 375px width
- [ ] 5:45 Repo public, deck and paragraph submitted

## Lane A: Zac (project manager / intake)

- [ ] Scaffold the skeleton (React + Vite + TypeScript + Tailwind, `server/` folder) and push
- [ ] Routing in `src/App.tsx`: landing, intake, follow-ups, generating, verdict preview, writing full plan, full plan
- [ ] Landing screen with the idea textarea as the hero (see `docs/design/DESIGN.md`)
- [ ] Intake round 1: idea, skills, weekly hours, budget, location; "I'm not sure" on each
- [ ] Follow-up round screen that renders the AI's questions from Lane E's endpoint
- [ ] Labels, helper text, inline validation, focus on first error
- [ ] README: problem, solution, how to run, how we used AI, known limitations
- [ ] Fill PROJECT_BRIEF.md slides 4 and 5; replace assumed costs with Lane D's token log
- [ ] Pitch deck from the template and submission paragraph (confirm owner with the team)
- [ ] Merge lane branches into `main` every 30 minutes

## Lane B: Eric (research)

- [ ] One or two fictional demo personas in `demo-data/`
- [ ] Scripted demo conversation (fictional answers to round 1 and follow-ups) for the fallback
- [ ] Rough number of potential customers in the North East, with source
- [ ] "Why now" sentence, with source
- [ ] Source for the 2% to 5% free-to-paid conversion rule of thumb, or tell Zac to drop it
- [ ] Verified local support list only (name, what it offers, link), for the prompt and the demo
- [ ] Three realistic, fictional test ideas for Lane D

## Lane C: Michael (UI design)

- [ ] Own and update `docs/design/DESIGN.md`; map its tokens into the Tailwind config
- [ ] Confirm the rating labels with Lane D (proposed: Strong / Promising / Needs work / Not viable yet)
- [ ] Staged generating screen with real progress messages
- [ ] Verdict preview: overall and area ratings as words, top 2 risks, "A rough view, not a prediction"
- [ ] Paywall panel: what unlocks, £4.99, one primary button
- [ ] "Writing your full plan" loading screen (20 to 40 seconds)
- [ ] Full plan: improvements, roadmap route, improved business plan reading column
- [ ] Error / fallback notice with "Try again" and "See an example plan"
- [ ] Run the anti-slop checklist in DESIGN.md before each merge

## Lane D: Khaliq (AI and API usage)

- [ ] Define `src/types/roadmap.ts` first (follow-up round, verdict, improvements, roadmap, improved business plan, preview/paid flags) and announce it
- [ ] Decide whether to rename the contract file now it holds the whole plan
- [ ] Prompt: follow-up questions (up to about 5, plus an "enough" flag)
- [ ] Prompt: call 1, JSON only, word ratings, honest reasons, cheap tests, professional advice
- [ ] Prompt: call 2, improved business plan (build after stage 1 works)
- [ ] Prompts forbid invented organisations, grants and statistics; local support only from Lane B's list
- [ ] Anthropic API call code with key from `.env` and model from `CLAUDE_MODEL`
- [ ] Strip code fences and parse inside `try/catch`
- [ ] Log input and output tokens for every call; give Zac the real cost per person and per payer
- [ ] Test with Lane B's three fictional ideas

## Lane E: George (backend flow)

- [ ] Route for follow-up rounds, enforcing a hard cap of 3 rounds and about 5 questions each
- [ ] Route for call 1; send only preview fields to the browser before unlock
- [ ] Mock unlock or Stripe test mode at £4.99
- [ ] Route for call 2 after unlock
- [ ] Fallback to `demo-data/` on any API or parse failure: scripted conversation, cached verdict, cached full plan
- [ ] Timeouts on every AI call so the demo never hangs
- [ ] `.env.example` with variable names only

## Decisions needed (team)

- [ ] Confirm idea.md 11b decisions
- [ ] Product name
- [ ] Final rating labels
- [ ] Who owns the pitch deck (provisionally Zac)
- [ ] Who presents, and the speaker split
- [ ] First customer segment for slide 5
- [ ] Export format, or drop it
