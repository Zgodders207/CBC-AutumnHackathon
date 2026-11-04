# Lane E server

Serves the prototype and the AI routes on one local port. Kept separate from the root `package.json` (Lane A) until Zac merges them.

```
cd server
npm install
cp .env.example .env      # or put the keys in the repo-root .env; both are git-ignored
npm start                 # http://127.0.0.1:8787/prototype/
npm test                  # offline: fake AI, no key, no cost
npm run check             # typecheck
```

## Which AI it uses

| Key set in `.env` | Result |
|---|---|
| `ANTHROPIC_API_KEY` | Claude, via Khaliq's engine (`server/ai/`). |
| `GEMINI_API_KEY` | Gemini (`GEMINI_MODEL`, default `gemini-3.5-flash`) through `gemini.ts`. |
| `GROQ_API_KEY` | Groq (`GROQ_MODEL`, default `openai/gpt-oss-120b`) through `groq.ts`. |
| none | AI off. `/api/health` says so and the page runs its scripted demo. |

The two adapters are small translators in `server/`; the engine is untouched. With several keys set, `AI_PROVIDER=anthropic|gemini|groq` picks one; if it is empty the first key found wins, in that order.

Shared team keys for Gemini and Groq are committed in `server/keys.env` (on purpose, they are public), so `npm start` works with no setup. A personal `.env` overrides them. Google's free tier allows only about 20 requests a day per model, and one person's plan takes 3. Groq refuses requests from some networks (VPNs, datacenters) with a 403 "check your network settings", whatever the key.

## Routes

`GET /api/health`, `POST /api/followups`, `POST /api/plan`, `POST /api/unlock` (mock payment), `POST /api/improved-plan` (402 until unlocked). The browser never receives paid fields before unlock. `/api/plan` also returns a `numbers` block (0-100 per score and overall) for the page to show next to the word rating.

Only `index.html`, `prototype/` and `docs/design/` are served as files. Per-IP AI limits come from `AI_CALLS_PER_IP_PER_HOUR` and `AI_CALLS_PER_DAY`.

## Live site (Firebase)

`functions/` wraps this server as one Cloud Function, `api` (europe-west2), behind a Hosting rewrite of `/api/**`. Sessions and rate limits live in Firestore there; the Groq key is a Function secret. Deploy: `firebase deploy` from the repo root (the predeploy step installs and bundles). The page itself is served by Hosting, so `server/`, `src/` and `prompts/` are not published. Hosting cuts requests at 60 seconds; the paid improved plan takes about 40.
