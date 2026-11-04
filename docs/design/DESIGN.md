# DESIGN.md

The visual and interaction rules for this project. Every Claude session building UI must read this before touching a component. **This is a living document: humans may edit any section.** If a rule here conflicts with a human instruction, the human wins; update this file so the next session knows.

Owner: Lane C (Michael). Product behaviour lives in `idea.md`; this file only covers how it looks and feels.

## 1. Direction

**Subject:** an honest business planner for people in the North East who are unsure whether their business idea would last. It gives a sustainability verdict, what to improve, and a roadmap of cheap tests.

**Feeling:** a calm, trustworthy adviser who tells you the truth kindly. Closer to a well-made planning notebook than a startup landing page. It should feel designed for this product, not generated for any product.

**The one memorable thing: the route.** The roadmap is rendered as a single vertical route line with stops, like a transit map. Each stop is a step. This is the only place we spend visual boldness; the verdict and improvements screens stay quiet and typographic. Numbered stops are legitimate here because the roadmap genuinely is a sequence.

**Why this wins with the judges:**

| Criterion | Weight | What the design does for it |
|-----------|--------|-----------------------------|
| Technical quality | 40% | A visible, staged generation process; the AI's assumptions and limits are shown, not hidden |
| Real-world fit | 30% | Works on a phone, plain language, respects budget and time, an honest verdict |
| Investability | 15% | A clear paywall that shows exactly what the buyer gets |
| Go-to-market | 15% | Landing screen states who it is for in one sentence |

## 2. Non-negotiables

1. Light theme by default. Dark theme is a stretch goal, opt-in via `[data-theme="dark"]`.
2. Warm-grey neutrals. Never pure `#FFFFFF` page backgrounds or pure `#000000` text.
3. Two font weights only: 400 and 500. No 700.
4. Sentence case everywhere: buttons, headings, labels, nav.
5. Gently rounded corners, 6 to 14px. No pills unless it is genuinely a tag or toggle.
6. Flat by default. Depth from surface colour and hairline borders. Shadows only on overlays (modals, popovers).
7. One primary button per screen.
8. No invented numbers anywhere in the UI: no fake user counts, testimonials, ratings, or "trusted by" logos. Demo data is fictional and labelled as an example.
9. The verdict is never dressed up as good news. Neutral, honest presentation for every outcome.

## 3. Colour tokens

Accent is a muted river teal (a nod to the Tyne, not a brand colour). It is rationed: primary buttons, links, the route line, and focus rings only.

```css
:root {
  /* Neutrals: warm grey, not cream */
  --bg: #F7F6F3;
  --surface: #FCFBF9;
  --card: #FFFFFF;          /* cards only, never the page background */
  --text: #1E1C19;
  --text-muted: #5F5B55;    /* darkened for projector legibility */
  --text-faint: #97928A;    /* decorative only, never for information */
  --border: #E2DED7;
  --border-strong: #CFCAC1;

  /* Accent: muted river teal (swappable, keep it muted) */
  --accent: #3F5F5A;
  --accent-hover: #334E4A;
  --accent-bg: #E4ECEA;
  --accent-text: #2C4541;
  --on-accent: #FFFFFF;

  /* Semantic roles (always paired with an icon or label, never colour alone) */
  --success: #5E7A4F;
  --warning: #9A6A1A;
  --risk: #A6503C;
  --risk-bg: #F5E6E1;

  /* Type */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-serif: 'Source Serif 4', Georgia, 'Times New Roman', serif;

  /* Radius */
  --radius-sm: 6px;
  --radius: 10px;
  --radius-lg: 14px;

  /* Spacing scale */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 24px; --space-6: 32px; --space-7: 48px; --space-8: 64px;
  --space-9: 96px;

  /* Elevation: overlays only */
  --shadow-overlay: 0 10px 30px rgba(30,28,25,0.10), 0 1px 3px rgba(30,28,25,0.06);

  /* Motion */
  --dur-fast: 120ms;
  --dur: 200ms;
  --dur-slow: 320ms;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
}

[data-theme="dark"] {
  --bg: #161512;  --surface: #1E1C18;  --card: #232019;
  --text: #ECE9E2; --text-muted: #B0AAA0; --text-faint: #7C776E;
  --border: #322E28; --border-strong: #423D35;
  --accent: #8FB3AC; --accent-hover: #A6C4BE; --accent-bg: #1F2D2A;
  --accent-text: #B9D2CC; --on-accent: #14201E;
  --risk: #D88A74; --risk-bg: #33201A;
  --shadow-overlay: 0 12px 34px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.4);
}
```

Expose these as CSS variables and reference them in the Tailwind theme. **Never ship the default shadcn/ui palette or any library's default theme unmodified;** it is one of the most recognisable generated looks.

## 4. Typography

Serif for headings carries the personality; sans for body and UI stays out of the way. Maximum two typefaces. Load both from Google Fonts with `font-display: swap`.

| Role | Size (desktop / mobile) | Family | Weight | Line height | Tracking |
|------|------|--------|--------|-------------|----------|
| Display | 52 / 34px | serif | 500 | 1.1 | -0.02em |
| H1 | 40 / 30px | serif | 500 | 1.15 | -0.01em |
| H2 | 30 / 24px | serif | 500 | 1.2 | -0.01em |
| H3 (step titles) | 22 / 20px | serif | 500 | 1.3 | 0 |
| Body large | 18 / 18px | sans | 400 | 1.6 | 0 |
| Body | 16 / 16px | sans | 400 | 1.65 | 0 |
| Caption | 14 / 14px | sans | 400 | 1.5 | 0.01em |

Rules:
- Reading columns max 68 to 72 characters.
- Use `font-variant-numeric: tabular-nums` for all prices, costs and timeframes.
- Use curly quotes and the `…` character.
- Do not highlight a single word in a headline with a different colour, italic or weight.
- No all-caps labels. No eyebrow label above every heading.

## 5. Layout and screens

Content is **left aligned** throughout. Max content width about 1080px; result columns about 720px. Section padding up to 96px on desktop, 48px on mobile.

### Landing (the demo starts here)

The hero is the product itself: the first input, not a marketing banner.

```
+------------------------------------------------------------+
| [wordmark]                                                 |
|                                                            |
| Find out if your business idea would last,                 |  <- H1, serif
| before you spend money on it.                              |
| An honest check, what to fix first, and the cheapest       |  <- body large, muted
| way to test it. Free to preview.                           |
|                                                            |
| +--------------------------------------------------------+ |
| | Describe your idea in a sentence or two…               | |  <- textarea
| +--------------------------------------------------------+ |
| [ Check my idea ]   See an example plan                    |  <- primary + link
|                                                            |
| How it works: three plain sentences, no icon grid.         |
+------------------------------------------------------------+
```

### Intake

One question per step, with a quiet progress indicator ("Step 2 of 4"). Every field has a visible label and helper text. "I'm not sure" is always allowed.

### Generating

Never a bare spinner. Staged progress that reflects what is really happening, e.g. "Reading your answers…", "Checking whether it could last…", "Working out what to fix first…", "Building your roadmap…". Keep the user's answers visible so the screen is never empty.

### Verdict preview (free)

Typographic and calm. The verdict is the headline; reasons sit directly beneath it.

```
 Your idea: mobile bike repair, Gateshead
 Based on 6 hours a week and a £300 budget.   [Edit answers]

 Could work, with changes                         <- H1, serif, plain text
 Reasons it might not work:
   [!] Risk  Demand may be seasonal…
   [!] Risk  Travel time eats into 6 hours a week…

 What to improve first (preview)
   Idea              1 of 3 shown
   Business model    locked
   Your situation    locked

 [ Unlock full plan ]                              <- paywall panel
```

- The verdict uses neutral text colour for every outcome; no green-for-good or red-for-bad headline.
- Risks use `--risk` with a warning icon and the word "Risk". Never colour alone.

### Full plan (paid)

1. **Improvements**, in three plainly labelled groups: idea, business model, your situation. Each item: what to change, why, and how to check it cheaply.
2. **Roadmap**, rendered as the route:

```
 ●  Test demand cheaply          2 weeks    £20
 |  First step: …
 |  Test it cheaply: …
 |
 ●  First paying customer        4 weeks    £120
 |
 ●  Decide: grow or stop
```

- Route line: 2px `--accent`, stops are 12px circles. Before unlock, stops are hollow with a lock icon and the word "locked".
- Cost and time in tabular figures.
3. **What this plan assumes** and **Where to get proper advice**, as expandable sections at the end.

### Paywall

- Show exactly what unlocks: locked section titles stay visible; only their detail is hidden.
- Do not blur fake text behind the lock. State it plainly: "Unlock the full plan: all improvements and your roadmap. £[price], one-off."
- One primary button. Price in tabular figures. No countdown timers, no "limited offer" pressure.

## 6. Components

- **Primary button:** `--accent` fill, `--on-accent` label, radius 10px, padding 10px 18px, min height 44px on mobile. Label names the action: "Check my idea", "Unlock full plan".
- **Secondary button:** transparent, `--border-strong` hairline, `--text` label.
- **Card:** `--card` on `--bg`, 1px `--border`, radius 14px, padding 24px, no shadow at rest. Use sparingly; not every item needs a card.
- **Input / textarea:** `--surface` fill, `--border` hairline, radius 10px, min height 44px, font size at least 16px (prevents iOS zoom). Focus: 2px `--accent` ring via `:focus-visible`.
- **Expandable section:** native `<details>`/`<summary>` or an accessible disclosure; chevron rotates on open.
- **Icons:** Lucide, stroke 1.5, 20px inline, `currentColor`. One set only. No emoji in the interface.
- **Nested radius:** a child's radius is never larger than its parent's.

## 7. AI-specific patterns

These directly support the technical quality criterion ("explain how it works, where it fails and how you used AI").

1. **Show assumptions.** Every plan lists what it assumed from the user's answers, editable in one click.
2. **Show limits.** A short, permanent note: what the AI cannot know (local regulations, exact prices) and where to check.
3. **Graceful failure.** If generation fails, say what happened and offer "Try again" plus "See an example plan". Errors never apologise and never say only "Something went wrong".
4. **No fake confidence.** No percentage scores or "92% chance of success" style numbers the model cannot justify.

## 8. Copy

- Plain words, active voice, one idea per sentence, sentence case.
- Write for someone without a business background. "Money you need before you start", not "capital requirements".
- Fixed vocabulary, used everywhere: **plan** (the whole result), **verdict** (the sustainability check), **improvements**, **roadmap**, **step** (a stop on the roadmap). Do not swap in "journey", "report" or "phase".
- No filler ("Welcome!", "Let's get started!", "Unlock your potential"). No hype words ("revolutionary", "seamless", "supercharge").
- Loading states end in an ellipsis: "Building your roadmap…".

## 9. Motion

- Motion only responds to the user: expanding a section, confirming a step, a stop appearing on the route as it is generated.
- One orchestrated moment only: stops drawing onto the route. No fade-up on every section, no hover lift on every card.
- Animate `transform` and `opacity` only. Never `transition: all`.
- Honour `prefers-reduced-motion: reduce` by removing transitions.

## 10. Accessibility floor

- Fully keyboard operable; visible `:focus-visible` rings everywhere.
- Every input has a `<label>`. Icon-only buttons have `aria-label`.
- Text contrast at least WCAG AA (4.5:1 for body text) in both themes.
- Errors appear next to their field; focus moves to the first error on submit.
- Links that navigate are `<a>`, not styled buttons or divs.
- Never block zoom or paste.

## 11. Demo and projector rules

The pitch room projector washes out colour and thin lines (visible in our photos of the briefing slides). Therefore:

- Demo at 125% browser zoom. Check the verdict and roadmap screens at that zoom before 5:15pm.
- Never put information in `--text-faint`. Hairline borders are decoration only; nothing should depend on seeing them.
- The demo path must work with the cached example plan if the API or Wi-Fi fails.
- Judges may open the app on their phones: test the full flow at 375px width.
- Type the idea live on stage; use "See an example plan" only as the fallback.

## 12. Pre-merge anti-slop checklist

Run before merging any UI change. If any answer is yes, fix it.

- [ ] Purple, indigo or blue gradients, or gradient text on a heading?
- [ ] A cream background with a terracotta or clay accent?
- [ ] Glassmorphism or glow without a functional reason?
- [ ] Identical rounded cards in a grid with the same soft shadow under each?
- [ ] A centred hero with a floating blob, orb or abstract 3D shape?
- [ ] An all-caps eyebrow label above a heading?
- [ ] Middle-dot metadata strings ("A · B · C") or arrows appended to button text?
- [ ] Emoji used as icons?
- [ ] A library's default theme left unmodified?
- [ ] Any invented statistic, testimonial or logo?
- [ ] Pulsing badges, sparkle icons or "AI-powered" labels as decoration?
- [ ] A bare spinner with no explanation?
- [ ] A green or celebratory treatment on the verdict?
- [ ] An element whose position cannot be explained by the grid or an alignment edge?

Final pass, from Chanel: before shipping a screen, remove one decoration.

## 13. Sources consulted

- Anthropic, frontend-design skill (September 2026 revision): named clusters of current generated-design tells.
- capitalandcompute.net, "How to Fix AI Slop in Web Design, Tell by Tell" (2026).
- Impeccable by Paul Bakaus: browser detector for 41 UI anti-patterns.
- Vercel, Web Interface Guidelines: keyboard, forms, motion and layout MUST rules.
- HackerEarth, "How to Win a Hackathon: 10 Tips" and Reskilll judging guides: rubric-led scoping, demo resilience, mobile checks.
- Claude Builder Club Northumbria briefing slides: judging weights and Track 3 "Think about" prompts.
