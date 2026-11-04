# DESIGN.md

The visual and interaction rules for this project. Every Claude session building UI must read this before touching a component. **This is a living document: humans may edit any section.** If a rule here conflicts with a human instruction, the human wins; update this file so the next session knows.

Owner: Lane C (Michael). Product behaviour lives in `idea.md`; this file only covers how it looks and feels.

**Reference build:** `docs/design/example.html`. Open it in a browser. It is the approved look (signed off by Zac as PM). When this file and the reference disagree, the reference wins and this file gets fixed. All content in it is fictional and "Groundwork" is a working name only.

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
6. Ratings are **words**, never numbers, stars, bars or percentages. Neutral colour for every rating; no green-for-good.
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

- **Frost** (light glass): the verdict sheet. `--glass-light`, `backdrop-filter: blur(28px) saturate(170%)`, 1px white border at 75%, a bright inner top highlight, and a deep soft shadow.
- **Smoke** (dark glass on green): idea input, pricing panels, closing elements. `--glass-dark`, `blur(22px) saturate(150%)`, 1px white border at 16%, inner top highlight.
- **Nav:** a floating frosted dark bar, sticky, with the persistent "Check my idea" button.
- Only these surfaces get glass. Roadmap tiles and the honesty cards use solid light panels with an inner highlight instead.
- Always include `-webkit-backdrop-filter`, and the `@supports not` fallback to near-solid panels from the reference.
- Contour lines: thin strokes at 10% opacity, generated by the script in the reference (`svg[data-topo]`).
- A subtle film grain covers the page (`body::after`, 7% multiply). Keep it subtle.

Copy the `.frost`, `.smoke`, `.nav` and `.field` rules from the reference rather than reinventing them.

## 6. Screens

Use the reference for the landing page. App screens follow the same system:

- **Landing:** green hero, headline left, smoke-glass idea input with yellow button, frosted verdict sheet right overlapping into the page. Then roadmap, pricing band, honesty section, closing panel.
- **Intake:** round 1 is one question per screen on paper. Follow-up rounds show the AI's questions together under "A few more questions" with "Round 2 of up to 3". A form, never chat bubbles.
- **Generating:** staged messages that reflect real work ("Reading your answers…", "Checking whether it could last…"). Never a bare spinner.
- **Verdict preview (free):** the frosted sheet: idea summary, overall word rating with the four-word scale (Not viable yet / Needs work / Promising / Strong) and the chosen one filled in ink, "A rough view, not a prediction", the three area ratings, the top 2 risks, then the paywall panel.
- **Paywall:** "Unlock the full plan: improvements for each area, your roadmap and an improved business plan. £4.99, one-off." One yellow button. No timers or pressure.
- **Writing your full plan (paid):** may take 20 to 40 seconds; staged progress, reveal sections as they arrive.
- **Full plan:** improvements in three groups, the roadmap as the route (filled yellow stops for unlocked steps, hollow dashed tiles for locked ones), the improved business plan in a reading column, then "What this plan assumes" and "Where to get proper advice" as expandable sections.
- **Error / fallback:** say what happened, offer "Try again" and "See an example plan". Never only "Something went wrong".

## 7. Components

- **Primary button:** `--signal` fill, `--signal-ink` label, radius 11px, min height 46px (44px minimum on mobile), inner top highlight, warm soft shadow. Label names the action: "Check my idea", "Unlock full plan, £4.99".
- **Input:** at least 16px text (prevents iOS zoom), visible label (visually hidden is fine if the placeholder is an example), yellow caret, 2px focus outline.
- **Panels:** radius 18 to 26px; children always have a smaller radius than their parent.
- **Icons:** thin line icons, one consistent stroke, `currentColor`. No emoji.
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
- [ ] A number, star, bar or percentage used as a rating, or green on a good verdict?
- [ ] A risk hidden behind the paywall?
- [ ] Any invented statistic, testimonial, logo, organisation or grant?
- [ ] Emoji used as icons?
- [ ] A library's default theme left unmodified?
- [ ] A bare spinner?
- [ ] Unthemed selection, focus ring or caret?

## 13. Sources consulted

- Impeccable by Paul Bakaus (craft floor, new-work and anti-pattern references): committed colour at page scale, no eyebrow labels, themed browser surfaces, one authored motion moment.
- Anthropic, frontend-design skill (September 2026 revision): current generated-design tells.
- Vercel, Web Interface Guidelines: keyboard, forms, motion and layout rules.
- Claude Builder Club Northumbria briefing slides: judging weights and Track 3 prompts.
