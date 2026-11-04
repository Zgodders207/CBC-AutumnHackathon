# DESIGN.md

The visual and interaction rules for this project. Every Claude session building UI must read this before touching a component. **This is a living document: humans may edit any section.** If a rule here conflicts with a human instruction, the human wins; update this file so the next session knows.

Owner: Lane C (Michael). Product behaviour lives in `idea.md`; this file only covers how it looks and feels.

**Reference build:** `docs/design/example.html`. Open it in a browser. It is the approved look (signed off by Zac as PM). When this file and the reference disagree, the reference wins and this file gets fixed. All content in it is fictional and "Groundworking" is a working name only.

**App screens reference:** `docs/design/app-screens.html`. A clickable build of every screen after the landing page (PDF review, round 1, follow-ups, generating, score page, checkout, writing, full plan, error), built on `example.html`. **To build a screen, copy its `<section>` and the CSS it uses from this file, then change only the content.** Do not re-create it from the text below, and do not rewrite its CSS into Tailwind classes; import it as one global stylesheet and reuse the class names. When this file and the reference disagree, the reference wins. Sections 6 and 7 describe what the reference contains.

## 1. Direction

**Subject:** an honest business planner for people in the North East who are unsure whether their business idea would last.

**Feeling:** premium, calm and trustworthy. Deep Tyne Bridge green fields carrying faint topographic contour lines (a nod to North East landscape maps), with frosted glass panels floating over them and one warm signal yellow.

**Light mode only for the hackathon.** The pitch is on a projector in a lit room. Do not build a dark theme.

**Signature moments (spend boldness only here):**
1. The frosted verdict sheet overlapping out of the green hero into the page below.
2. The roadmap route line that draws itself across the page on scroll.

**Why this wins with the judges:**

| Criterion | Weight | What the design does for it |
|-----------|--------|-----------------------------|
| Technical quality | 40% | Staged generation, visible assumptions and limits, polished states |
| Real-world fit | 30% | Works on a phone, plain language, an honest verdict |
| Investability | 15% | A clear paywall that shows exactly what the buyer gets |
| Go-to-market | 15% | The first screen says who it is for in one sentence |

## 2. Non-negotiables

1. Light mode. Warm-cool off-white paper, never pure `#FFFFFF` pages or pure `#000000` text.
2. One typeface: **Archivo**, using its width axis. Weights 400 and 500 only.
3. Sentence case everywhere.
4. **No eyebrow labels** (small text above a heading). The heading speaks for itself.
5. One primary button per view, always signal yellow with dark ink text.
6. Ratings are **words**, never numbers, stars, bars or percentages. Each word has its own colour so it stands out (Lane C decision, 4 Nov): Not viable yet `#A9432B` on `#F6E1D9`, Needs work `#8F5409` on `#FAEBCB`, Promising `#2D6A50` on `#DCEEE3`, Strong `#0F4A35` on `#C4E3D2`. The word is always shown, so colour is never the only signal. Set colours with the `data-r` attribute (`notviable`, `needswork`, `promising`, `strong`), never by hand. Keep them muted: no bright greens, glows or celebration effects.
7. Bad news is never hidden behind the paywall.
8. No invented numbers, testimonials, logos, organisations or grants. Demo data is fictional and labelled "Example with fictional answers".

## 3. Colour tokens

Strategy: **committed**. Green owns whole regions (hero, pricing band, closing panel); paper owns the rest. Yellow is rationed to primary buttons, route stops, text selection and the focus ring.

```css
:root{
  --paper:#F2F4F0; --ink:#0F221B; --ink-2:#3B4F47; --line:#D2DBD5;
  --field:#1B5541; --field-deep:#123D2F; --on-field:#F3F6F2; --on-field-2:#C6D9CF;
  --signal:#F2C94C; --signal-hi:#F7D875; --signal-ink:#2A2208; --risk:#A9432B;
  --glass-light:rgba(250,252,249,0.70); --glass-dark:rgba(255,255,255,0.08);
  --font:'Archivo','Helvetica Neue',Arial,sans-serif;
  --ease:cubic-bezier(0.16,1,0.3,1);
}
```

Green fields are lit, not flat: a linear base from `#1E5C46` to `#123D2F`, a soft pale-green light top right, and a faint warm glow bottom left. Copy the `.field` rule from the reference.

Risks use `--risk` with a warning icon and the word "Risk". Never colour alone.

## 4. Typography

Archivo from Google Fonts (`wdth 62..125`, `wght 400..600`, `display=swap`). Width carries the hierarchy:

| Role | Size | Width | Weight | Line height | Tracking |
|------|------|-------|--------|-------------|----------|
| Display (h1) | clamp(2.8rem, 6.8vw, 6rem) | 112 | 500 | 0.95 | -0.04em |
| Section heading (h2) | clamp(2.1rem, 4.6vw, 3.8rem) | 112 | 500 | 1.0 | -0.038em |
| Verdict word | clamp(2.3rem, 3.8vw, 3.4rem) | 118 | 500 | 1.0 | -0.038em |
| Price | clamp(3.2rem, 7vw, 5.6rem) | 120 | 500 | 1.0 | -0.05em |
| Card title (h3) | 20 to 22px | 108 | 500 | 1.15 | -0.02em |
| Body | 17px | 100 | 400 | 1.6 | 0 |
| Small | 14px | 100 | 400 | 1.5 | 0 |

Rules: `text-wrap: balance` on headings, reading columns max about 60 characters, `tabular-nums` on every price, cost and timeframe, curly quotes and `…`.

## 5. Glass

Glass is deliberate here, not decoration. It only works with texture behind it, which is why green fields carry contour lines.

- **Frost** (light glass): the verdict sheet and the checkout dialog. `--glass-light`, `backdrop-filter: blur(28px) saturate(170%)`, 1px white border at 75%, a bright inner top highlight, and a deep soft shadow.
- **Smoke** (dark glass on green): idea input, pricing panels, the generating stage list, closing elements. `--glass-dark`, `blur(22px) saturate(150%)`, 1px white border at 16%, inner top highlight.
- **Nav:** a floating frosted dark bar, sticky, with the persistent "Check my idea" button.
- Only these surfaces get glass. Roadmap tiles and the honesty cards use solid light panels with an inner highlight instead.
- Always include `-webkit-backdrop-filter`, and the `@supports not` fallback to near-solid panels from the reference.
- Contour lines: thin strokes at 10% opacity, generated by the script in the reference (`svg[data-topo]`).
- A subtle film grain covers the page (`body::after`, 7% multiply). Keep it subtle.

Copy the `.frost`, `.smoke`, `.nav` and `.field` rules from the reference rather than reinventing them.

## 6. Screens

The landing page follows `example.html`; every other screen is in `app-screens.html`. Each app screen uses one of three **page types**, so the whole flow feels like one product:

| Page type | Background | Used for | Layout |
|-----------|------------|----------|--------|
| **Field page** | Full-height green `.field` with contour lines, nav sits on it | Landing, generating, error | Main column left, "Your answers" panel right (360 to 380px) |
| **Paper page** | `--paper`, nav switches to its solid dark state | Round 1, follow-up rounds, PDF review | Question column left (max 720px), sticky "Your answers so far" panel right (360px) |
| **Split page** | Green field band on top, paper below | Score page, full plan | Field band holds the headline content; paper holds the detail |

Spacing: content starts `clamp(48px, 6vw, 80px)` below the nav. Column gap `clamp(32px, 5vw, 80px)`. Below 900px every layout becomes one column, the answers panel stops being sticky and moves under the main column. Use `padding-block` (not the `padding` shorthand) on any element that also has `.wrap`, or the side gutters disappear.

### Screen by screen

- **Landing (field):** as the reference. The right column is the frosted example verdict sheet, labelled "Example with fictional answers". Optional line under the input: "Already have a business plan or accounts? Upload a PDF to save time." (only if the team builds the upload).
- **PDF review (paper, proposed feature):** heading "Here's what we found". File chip with the file name, one line saying what happens to the file ("read once for this check and not kept afterwards", only once Lane E confirms it), then a list of what was found, each row with "Edit". Fields not in the PDF say "Not in the PDF, we'll ask". Primary: "Looks right, continue"; text link: "Skip the PDF and answer questions instead".
- **Round 1 (paper):** "Question 4 of 5" plus the progress bar, then the question as the heading, one helper sentence, answer tiles in two columns, "Not sure" always the last tile. Primary "Continue", text link "Back". The answers panel shows what is known so far; the current row says "Answering now…" and later rows say "Next".
- **Follow-up round (paper):** "Round 2 of up to 3", heading "A few more questions", helper "Written by Claude from your answers so far. Skip any you can't answer." Questions are stacked rows separated by hairlines, each with a one-line "why we ask" in `--ink-2`, answered with chips or a text input. Never chat bubbles.
- **Generating (field):** heading "Checking your idea…", a smoke panel listing the real stages, and the answers panel on the right. One line under the stages saying the example plan is shown if the connection drops.
- **Score page (split):** frosted verdict sheet on the left and the paywall panel on the right, **always the same height**, both overlapping 120px down out of the field band into the paper together (signature moment 1). Move the whole `.score-grid` down, never one card. Under the band, two short notes on paper: "What it can't know" and "When to get proper advice".
- **Checkout (dialog over the score page):** frost dialog, line item "Full plan, one-off £4.99", a dashed note "Test mode. No real payment is taken in this demo.", primary "Pay £4.99", text link "Not now". Escape closes it.
- **Writing your full plan (split):** the full plan page with an ink "Writing your improved business plan…" card at the top of the paper column and grey placeholder lines where the improved business plan will appear. Improvements and roadmap show straight away.
- **Full plan (split):** field band with the "Example with fictional answers" tag (when it is the example), the heading "Your plan: [idea], [place]", one line of all five ratings, and a quiet "Download as PDF" button (export format still TBD). Paper below: section nav on the left (200px, sticky), then improvements, roadmap, improved business plan, and the two expandable sections.
- **Error (field):** heading "Your check didn't finish", one sentence on what happened and that answers are kept, primary "Try again", quiet "See an example plan", answers panel on the right.

### The verdict: four scores

The verdict shows an **overall** rating plus four scores, all as words on the four-word scale (Not viable yet / Needs work / Promising / Strong):

1. Financial stability
2. Long-term sustainability
3. Room in the market (higher always means better for the person, so never "Saturation")
4. Skills and ability

Each score has a one-line reason under it. The top 2 risks follow, always free. Improvements in the full plan are grouped by the same four scores, in the same order.

## 7. Components

Every component below already exists in `app-screens.html` under the class names given. Copy it from there rather than building it from this description. Radii nest: page panels 18 to 26px, tiles 16px, chips and inputs 11 to 12px.

- **Primary button** (`.btn`): `--signal` fill, `--signal-ink` label, radius 11px, min height 46px (44px minimum on mobile), inner top highlight, warm soft shadow. Label names the action: "Check my idea", "Continue", "Unlock full plan, £4.99", "Try again". One per view.
- **Quiet button** (`.btn-quiet`): transparent, 1px border at 22% ink (28% white on green), same height and radius as primary. For secondary actions such as "See an example plan" or "Download as PDF".
- **Text link** (`.textlink`): 15px, `--ink-2`, underlined. For "Back", "Skip…", "Change an answer".
- **Nav** (`.navbar`, `.nav`; paper state `.navbar.on-paper`): the reference's floating smoke bar. On paper pages use the solid state, `background: rgba(16,44,33,0.86)`, so it stays readable without green behind it. Right side holds "Example plan" and "Start again" links; the yellow nav button only appears on the landing page.
- **Step label and progress bar** (`.steps-label`, `.bar`): 14px `--ink-2` label ("Question 4 of 5", "Round 2 of up to 3"), then a bar of 6px segments with 6px gaps, filled segments `--field`, empty segments `rgba(27,85,65,0.18)`, max width 380px.
- **Answer tile, single choice** (`.opts`, `.opt`): radius 16px, padding 18px 20px, `rgba(255,255,255,0.6)` with an inner white highlight, a 20px radio ring, a 17px label and an optional 14.5px description. **Selected:** filled `--ink` with light text and a yellow dot in the ring. Use `role="radio"` with `aria-checked`. Two columns on desktop, one on mobile.
- **Chip, single choice in follow-up rounds** (`.chips`, `.chip`): 15.5px text, padding 9px 15px, radius 11px, light panel; selected chip is filled `--ink` with light text.
- **Text input** (`.q input`): 17px, radius 12px, `rgba(255,255,255,0.7)` with a 16% ink border, yellow focus ring.
- **"Your answers" panel** (`.answers`): radius 20px, solid light panel on paper; on green it becomes `rgba(255,255,255,0.08)` with a 16% white border. Rows are label (96px, `--ink-2`) and value, split by hairlines. Ends with a "Change an answer" text link. Sticky at `top: 100px` on desktop only.
- **Stage list, loading** (`.stages`): a smoke panel, radius 22px, 18px rows. Each row has a 28px marker: empty ring (to do), yellow ring with a static yellow dot (now, text at weight 500), yellow fill with a dark tick (done). No looping animations, no spinners.
- **Score list** (`.sheet`, `.scale`, `.scores`, `.risks`): inside the frost sheet, a light panel (radius 18px) of rows: score name (500) left, rating word right (500, width 112, 18px), the reason on the next line in `--ink-2` at 15px.
- **Paywall panel** (`.pay.paid`): a **solid** dark green panel (not glass: it overlaps the paper, where smoke would vanish) with a yellow-tinted border, stretched to the verdict sheet's height. Top: "Unlock the full plan, one-off" and three items with yellow ticks. Bottom, pushed down with `margin-top: auto`: the price, the full-width primary button and one line "Your verdict and risks stay free, including the bad news."
- **Dialog** (`.overlay`, `.checkout`): frost, radius 24px, max width 440px, over a `rgba(9,26,20,0.45)` scrim. Focus moves to its primary button; Escape closes it.
- **Improvement card** (`.groups`, `.group`): light panel, radius 20px, two columns on desktop. Header row: score name (card title) and its rating word in `--ink-2`. Then the change in 500 weight, "Why:" and "Check it cheaply:" lines.
- **Route, full plan** (`.line`, `.stop`, `.dot`): the reference route with every stop unlocked: solid 6px `--field` line, yellow dots with ink rings, light tiles showing name, time and cost (tabular numbers) and one sentence. Locked stops (dashed tile, hollow dot) appear only before payment.
- **Writing card** (`.writing-card`, `.ghost`): solid `--ink` panel, radius 22px, a static yellow marker, a 18px title ending in "…" and one `--on-field-2` line. Placeholder lines below are 16px bars at 8% ink.
- **Expandable section** (`details`): native `<details>`, 18px summary at weight 500, chevron rotates 180° on open, hairlines between sections.
- **Example tag** (`.tag`): the reference's pill ("Example with fictional answers"). On green use 8% white with a 16% white border.
- **Icons:** thin line icons, 1.8 stroke, `currentColor`. No emoji.
- **Browser details:** themed `::selection` (yellow), focus ring (3px yellow, 3px offset), caret colour, `text-underline-offset`.

## 8. Copy

- Plain words, active voice, sentence case, one idea per sentence.
- Fixed vocabulary: **plan** (the whole result), **verdict**, **improvements**, **roadmap**, **step**, **improved business plan**.
- No filler or hype ("Welcome!", "seamless", "unlock your potential").
- Loading states end in `…`.

## 9. Motion

- One orchestrated moment: the route line draws and its stops rise in sequence when scrolled into view. Content is visible by default if script fails.
- Everything else only responds to the user (button press, expanding a section).
- Exponential ease-out (`--ease`). Never `transition: all`.
- Honour `prefers-reduced-motion` by removing transitions.

## 10. Accessibility floor

- Keyboard operable throughout, visible focus everywhere.
- Every input has a label; icon-only buttons have `aria-label`.
- Text contrast at least 4.5:1, including text on glass. Check the verdict sheet where it sits over green.
- Errors next to their field; focus moves to the first error.
- Links that navigate are `<a>`.
- Never block zoom or paste.

## 11. Demo and projector rules

- Demo at 125% browser zoom; check the verdict sheet and roadmap at that zoom before 5:15pm.
- Test the full flow at 375px width; judges may use their phones.
- The demo must work on the cached example plan if the API or Wi-Fi fails.
- Glass costs rendering performance on older phones; keep it to the surfaces in section 5.

## 12. Pre-merge checklist

Fix anything that answers yes:

- [ ] An eyebrow label above a heading?
- [ ] Glass on a surface not listed in section 5, or glass with nothing behind it?
- [ ] Purple or blue gradients, gradient text, neon glows?
- [ ] More than one yellow button in a view?
- [ ] A number, star, bar or percentage used as a rating, or a rating colour shown without its word?
- [ ] A risk hidden behind the paywall?
- [ ] Any invented statistic, testimonial, logo, organisation or grant?
- [ ] Emoji used as icons?
- [ ] A library's default theme left unmodified?
- [ ] A bare spinner?
- [ ] Unthemed selection, focus ring or caret?
- [ ] A paper page using the see-through nav, or an app screen not built on one of the three page types?
- [ ] A looping animation or spinner in a loading state?
- [ ] A score label where a better rating means a worse outcome (for example "Saturation")?

## 13. Sources consulted

- Impeccable by Paul Bakaus (craft floor, new-work and anti-pattern references): committed colour at page scale, no eyebrow labels, themed browser surfaces, one authored motion moment.
- Anthropic, frontend-design skill (September 2026 revision): current generated-design tells.
- Vercel, Web Interface Guidelines: keyboard, forms, motion and layout rules.
- Claude Builder Club Northumbria briefing slides: judging weights and Track 3 prompts.
