# CLAUDE.md

This file is read by every team member's Claude Code session. Several people are prompting Claude on this repo **at the same time**. Your top priority is to avoid stepping on anyone else's work.

## The project

A business planner for people in the North East who are unsure whether their business would be sustainable. A user describes their idea, skills, budget and time available; the AI produces:

1. An honest **sustainability check**, including reasons it might not work.
2. A round-up of **what to improve before starting**, split into the idea, the business model, and the user's own situation (budget, time, skills).
3. A **roadmap** of cheap first steps to test it.

We monetise with a free preview (the verdict, the main risks, and a taste of the improvements); payment unlocks the full improvement list and roadmap. It must never promise success or invent organisations, grants or figures. See `idea.md` for the full design.

- Hackathon: Claude Builder Club, Northumbria University. Track 3, "Start Something".
- Judging: Technical quality 40%, Real-world fit 30%, Investability 15%, Go-to-market 15%.
- All code is written on the day between 2:00pm and 5:45pm. **Code freeze at 5:45pm.**
- The demo must run live, end to end, on realistic input.

## Stack (confirm and edit at 2:00pm, then do not change)

- Frontend: React + Vite + TypeScript + Tailwind
- Backend: a small server route that calls the Anthropic API (the API key must never reach the browser)
- Model name read from `CLAUDE_MODEL` in `.env`
- Payments: mocked paywall, or Stripe **test mode** only
- Package manager: npm

Do not introduce new frameworks, libraries or tools without the team agreeing in the group chat first.

## Lanes (who owns what)

Each person works in one lane. **Only edit files inside your own lane.** If a change outside your lane is needed, stop and tell the human so they can ask the owner.

| Lane | Owner | Owns |
|------|-------|------|
| A. Project manager / Intake | Zac | `src/features/intake/` (idea questionnaire UI), `package.json` and lockfile, `README.md`, `src/App.tsx` and routing |
| B. Research | Eric | `docs/research/`, `demo-data/` (fictional personas, verified local-support facts) |
| C. UI design | Michael | `docs/design/`, Tailwind config and shared styles, `src/features/verdict/`, `src/features/roadmap/`, `src/features/paywall/` (screens, preview vs full, pricing display) |
| D. AI and API usage | Khaliq | `prompts/`, the Anthropic API call code, JSON parsing, cost logging |
| E. Backend flow | George | `server/` routes and request flow, unlock/payment (mock or Stripe test mode), fallback to cached demo data |

Shared files with a single owner:

- `src/types/roadmap.ts` is the **contract** between lanes. Owned by Lane D. Nobody else edits it. Changes are announced in the group chat before pushing.
- `package.json` and the lockfile: Lane A merges dependency additions. Ask before adding a package.

## Git rules

1. One person scaffolds and pushes the skeleton. Everyone else clones after that.
2. Work on a branch named after your lane, e.g. `lane-d-ai-api`.
3. `git pull --rebase origin main` before every session and before every push.
4. Commit small and often. Prefix messages with the lane: `[D] parse AI response JSON safely`.
5. Merge to `main` at least every 30 minutes so conflicts stay small.
6. Never force-push to `main`. Never rewrite shared history.
7. Never run a formatter or linter fix across the whole repo. Only format files you touched.
8. If a merge conflict touches another lane's file, keep their version and tell the human.

## Instructions for Claude

- Stay in the lane the human states at the start of the session. If they have not said, ask.
- Make the smallest change that achieves the goal. No unrequested refactors, renames or file moves.
- Do not delete or rewrite code you did not write in this session.
- Before editing a shared or out-of-lane file, stop and ask.
- Comment non-obvious logic so teammates can follow it quickly.
- Always handle loading, error and empty states in UI.
- After each change, tell the human exactly which files you touched.

## Secrets and data

- API keys live in `.env` only. `.env` is in `.gitignore`. Keep `.env.example` updated with variable names, never values.
- The repo is public at submission. Assume everything committed is visible.
- **Never use real people's personal data** (hackathon rule). Demo data in `demo-data/` must be fictional.

## Product guardrails (this is scored)

The track brief warns against bad advice with real costs, false encouragement, and ignoring people without laptops, time or money. Therefore the AI prompt must:

- Give an honest viability assessment, including reasons the idea may not work.
- Flag where the user should get professional advice (legal, tax, finance) rather than relying on the AI.
- Prefer cheap ways to test the idea before spending money.
- Account for the user's stated budget and available time.
- Point to real local support only if it is verified; never invent organisations, grants or figures.
- Work on a phone screen.

## AI output contract

The AI must return **JSON only**, matching `src/types/roadmap.ts`. That one object holds the sustainability verdict and risks, the improvements (idea, business model, user's situation) and the roadmap, each marked as free-preview or paid. Lane D strips code fences and parses inside `try/catch`; Lane E's server falls back to a cached demo result from `demo-data/` if the API fails, so the live demo never breaks.

## Cost tracking (needed for the business case)

Lane D logs input and output token counts for every generation to the console. This gives a real cost-to-serve figure for the pitch deck's "Who pays" slide.

## Timeline

| Time | Milestone |
|------|-----------|
| 2:00 | Stack confirmed, skeleton pushed, lanes assigned |
| 2:20 | Everyone building in their lane |
| 3:30 | Happy path works end to end (intake, generate, preview, unlock) |
| 4:30 | Feature freeze. Fix bugs and polish only |
| 5:15 | Full demo rehearsal on the demo machine |
| 5:45 | Code freeze. Repo public. Deck and paragraph submitted |

After 4:30, Claude should refuse to start new features and focus on stability.
