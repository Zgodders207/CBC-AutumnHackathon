# PROJECT_BRIEF.md

The single source of truth for **what** we are building and **why**. CLAUDE.md covers how we work; DESIGN.md covers how it looks. Humans may edit any section. Placeholders in [brackets] must be filled by the team, not by Claude.

## 1. One line

[Product name] turns a rough business idea into an honest, step-by-step roadmap, so people in the North East can get from idea to first paying customer.

## 2. Hackathon context

- Event: Claude Builder Club, Northumbria University.
- Track 3, "Start Something": how might we help more people in the North East start and grow something of their own?
- Track warnings we must answer: bad advice with real costs, false encouragement, and people without laptops, time or money.
- Build window 2:00pm to 5:45pm. Pitch 3 minutes with live demo, then 2 minutes of questions.

## 3. The problem

Many people in the region have ideas (students, career changers, people in insecure work), but the organisers' brief notes that few reach a first paying customer. The gap is not ideas; it is knowing what to do next, what it will cost, and whether the idea is worth pursuing at all.

Existing options and their gaps:
- Generic AI chat: unstructured, overly encouraging, forgets the user's constraints.
- Business advisers and courses: valuable, but slow to access and not always affordable.
- Templates and online guides: not tailored to the person's budget, time or location.

Why now: [team to add one sentence, e.g. cost-of-living pressure or growth in side incomes, only with a source].

## 4. Who it is for

**Primary user:** an aspiring founder in the North East with an idea, limited money, and limited hours each week.

Example persona (fictional, for the demo only): [name], a [career changer / student] in [town], with [N] hours a week and a £[budget] budget, who wants to [idea].

## 5. The solution

1. **Intake:** a short, one-question-per-step form covering the idea, skills, weekly hours, budget and location.
2. **Generate:** Claude produces a structured roadmap as JSON: an honest viability assessment, then phases, each with a first step, a cheap way to test it, a cost estimate, a timeframe and risks.
3. **Preview free:** the viability assessment and the first phase or two are free.
4. **Unlock:** the full roadmap is a paid, one-off purchase.

What makes it better than asking a chatbot:
- Structured and constrained by the user's real budget and time.
- Honest by design: it states reasons the idea may fail and recommends cheap tests before spending.
- Visible assumptions the user can correct, and clear signposting to professional advice.

## 6. Who pays (business case)

All figures below must come from the team's own reasoning. Believable assumptions beat polish.

| Item | Value | Basis |
|------|-------|-------|
| Payer | The founder (user pays) | [confirm, or name an alternative payer such as a council, university or enterprise agency] |
| Price per full roadmap | £[ ] | [why this price] |
| AI cost per roadmap | £[ ] | From Lane C's logged token counts |
| Other cost per customer | £[ ] | Payment fees, hosting |
| Fixed monthly costs | £[ ] | Hosting, domain, any wages at minimum wage or above |
| Break-even customers per month | [ ] | Fixed costs ÷ (price minus cost per customer) |
| Monthly revenue at 100 customers | £[ ] | |
| Monthly profit at 100 customers | £[ ] | |

## 7. First 100 customers (go-to-market)

- First target: [e.g. final-year students with a side project, or a specific community group].
- Their problem and our offer: [ ].
- Route in: [e.g. university enterprise teams, student societies, local business networks], with target numbers per route.
- Biggest risk: [e.g. people will not pay for advice they could get free], and how we would test it: [ ].

## 8. MVP scope (today)

**In scope**
- Landing screen with the idea input as the hero.
- Intake flow.
- Roadmap generation via the Anthropic API, server side.
- Roadmap view with the route design, preview and locked phases.
- Mock paywall or Stripe test mode.
- Cached example roadmap as a fallback.
- Token cost logging.

**Out of scope today**
- User accounts and saved roadmaps.
- Real payments.
- Verified directory of local funding or support (mention only if verified).
- Dark mode (stretch only).

## 9. Ethics and safety

- No real personal data anywhere (hackathon rule 4).
- The roadmap states its limits and points to professional legal, tax and financial advice.
- No invented organisations, grants, statistics or testimonials.
- Mobile-first so people without laptops can use it.

## 10. Three-minute demo script (draft)

| Time | Who | What |
|------|-----|------|
| 0:00 to 0:30 | [ ] | The problem and who has it, in one story |
| 0:30 to 2:00 | [ ] | Live demo: type an idea, intake, generation, roadmap, locked phases, unlock |
| 2:00 to 2:30 | [ ] | How it works and where it fails (assumptions, limits, fallback) |
| 2:30 to 3:00 | [ ] | Who pays, price, break-even, first 100 customers |

Likely judge questions to prepare for: cost per roadmap, why someone would pay instead of using free AI chat, how we stop bad advice, and who our first customers are.

## 11. Submission checklist (5:45pm)

- [ ] Working prototype, demoed live
- [ ] Public GitHub repo with README
- [ ] PowerPoint from the template: title slide plus up to 5 slides
- [ ] One paragraph: the problem, our solution and who pays
