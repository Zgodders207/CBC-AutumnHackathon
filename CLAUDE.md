# CLAUDE.md

This file is read by every team member's Claude Code session. Several people are prompting Claude on this repo **at the same time**. Your top priority is to avoid stepping on anyone else's work.

## VITAL: stay in sync with the team at all times

Teammates push constantly. Your memory of this repo goes stale within minutes. **Before EVERY response or action in this repo, without exception:**

1. Run `git fetch --all`, then check `git log --all --oneline -n 10` and `git branch -r` for new commits and branches.
2. If `origin/main` has moved, commit or stash your own work, then run `git pull --rebase origin main`. Never discard or overwrite a teammate's changes.
3. Tell the human in one line what changed since your last check (who, which files), or "No changes".
4. If any of these changed, re-read them before continuing, because they override anything you remember: `CLAUDE.md`, `idea.md`, `PROJECT_BRIEF.md`, `docs/design/DESIGN.md`, `TODO.md`, `src/types/roadmap.ts`.
5. If a change conflicts with the current task, or touches a file you are editing, **stop and tell the human** before going further.
6. Fetch and rebase again immediately before every push.

Never answer from memory of the repo. Work that teammates have not pushed is invisible to you, so commit and push small changes often.

## The project

A business planner for people in the North East who are unsure whether their business would be sustainable. A user describes their idea, skills, budget and time available, then answers a few AI-written follow-up questions; the AI produces:

1. An honest **verdict**: word ratings (never numbers) for the idea, the business model and the user's own situation, plus an overall rating and the main reasons it might not work.
2. A round-up of **what to improve before starting**, split into the idea, the business model, and the user's own situation (budget, time, skills).
3. A **roadmap** of cheap first steps to test it.
4. A **full improved business plan**, written by a second AI call only after payment.

We monetise with a free preview (all ratings and the top 2 risks; bad news is never hidden behind the paywall); **£4.99 one-off** unlocks the improvements, roadmap and improved business plan. Decisions and staging: `idea.md` section 11b. It must never promise success or invent organisations, grants or figures.

- Hackathon: Claude Builder Club, Northumbria University. Track 3, "Start Something".
- Judging: Technical quality 40%, Real-world fit 30%, Investability 15%, Go-to-market 15%.
- All code is written on the day between 2:00pm and 5:45pm. **Code freeze at 5:45pm.**
- The demo must run live, end to end, on realistic input.

## Project documents (read the relevant one before starting)

| File | What it is for | Owner |
|------|----------------|-------|
| `CLAUDE.md` | How we work: lanes, git rules, guardrails | Lane A |
| `idea.md` | **Source of truth for the product**: flow, features, data needs, AI design | Lane A merges; anyone proposes changes in the group chat |
| `PROJECT_BRIEF.md` | The pitch: business case, first 100 customers, demo script, submission checklist | Lane A |
| `docs/design/DESIGN.md` | Visual and interaction rules. **Read before any UI work** | Lane C |
| `TODO.md` | Tasks per lane | Each owner ticks only their own section |

If two documents disagree, `idea.md` wins on the product and `CLAUDE.md` wins on process. Tell the human so the other file gets fixed.

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
| A. Project lead and pull request management | Zac | `src/features/intake/` (idea questionnaire UI), `package.json` and lockfile, `README.md`, `src/App.tsx` and routing, `CLAUDE.md`, `idea.md`, `PROJECT_BRIEF.md`, pitch deck and submission paragraph (pitch ownership provisional until the team confirms) |
| B. Research | Eric | `docs/research/`, `demo-data/` (fictional personas, verified local-support facts), research figures for the business case |
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

The AI must return **JSON only**, matching `src/types/roadmap.ts`. There are three AI calls: follow-up questions (per round), call 1 (verdict, improvements, roadmap, each marked free-preview or paid) and call 2 (improved business plan, paid only). Lane D strips code fences and parses inside `try/catch`. Lane E's server enforces the round cap (3 rounds, about 5 questions each), never sends paid fields to the browser before unlock, and falls back to cached data from `demo-data/` if the API fails, so the live demo never breaks.

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
