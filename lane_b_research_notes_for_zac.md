# Lane B research notes for Zac (pitch and business case)

Research only. Nothing added to the repo. Every figure has a source; things I could not verify are marked.

---

## 1. Rough number of potential customers in the North East

**Use: about 9,000 new businesses a year.**

- Source: ONS, *Business demography, UK: 2024* (released 20 November 2025). North East: about 9,000 business births (11.8% of 77,000 active businesses) and 8,000 deaths (10.3%). Figures are in thousands, so they are rounded.
  https://www.ons.gov.uk/businessindustryandtrade/business/activitysizeandlocation/bulletins/businessdemography/2024
- Cross-check (different area, experimental): ONS rapid data for the North East Combined Authority area shows 1,705 business starts in Q1 2024. Same order of magnitude.
  https://evidencehub.northeast-ca.gov.uk/report/experimental-rapid-business-births-and-deaths

**Do not add this to the NatWest/Beauhurst numbers.** NatWest/Beauhurst count limited-company incorporations (about 10,400 in H1 2025). ONS counts businesses on its register. They measure different things, so quote one at a time with its source.

**What the number does and does not mean**
- It is a floor: businesses that got onto the register. It does not count people who are thinking about starting, or who gave up first. I found no source for that bigger group.
- It does not split by sector or by how many were sole traders.

**Honest arithmetic for the pitch (investors will do this sum)**
- 9,000 a year at £4.99 is about £45,000 a year if every single new business bought one.
- Your first-100 target is about 1.1% of the year's new businesses.
- So founders alone are a small market. The pitch should say how it grows: investor mode, mentor commission, or partner referrals. Do not hide the small number.

---

## 2. "Why now" sentence

**Main version (all three facts sourced):**

> North East company formation grew faster than anywhere in the UK in 2025 (up 5.3%), yet the region has the fewest businesses per head in England (744 per 10,000 adults, against 1,436 in London), and new registrations fell 9% in Q2 2026 while insolvency-related activity rose, so people need a cheap, honest check before they put money in.

Sources:
- 5.3% growth: NatWest/Beauhurst New Startup Index 2026. https://www.natwestgroup.com/news-and-insights/news-room/press-releases/enterprise/2026/feb/uk-company-numbers-hit-eight-yearhigh-at-566-million-natwest-and.html
- 744 vs 1,436 per 10,000 adults: DBT Business Population Estimates 2025, as quoted in the hackathon brief. https://www.gov.uk/government/statistics/business-population-estimates-2025/business-population-estimates-for-the-uk-and-regions-2025-statistical-release
- 9% fall and rise in insolvency-related activity (Q2 2026: 4,022 new companies, against 4,420 a year earlier): R3 Quarterly Business Health report. https://www.r3.org.uk/?p=297725

**Shorter alternative (one fact, strong):**

> From April 2026 the government-backed Start Up Loan rose from 6% to 7.5%, so a business idea that doesn't work now costs more to fund.

Source: https://www.business.gov.uk/support/funding-for-business/applying-for-start-up-loan (announces the change on 6 April 2026). Confirm the current rate on the official Start Up Loans site before it goes on a slide.

**Caution:** the 5.3% and the 9% are different measures from different providers (NatWest/Beauhurst uses Companies House data; R3 uses Creditsafe data). Name both on the slide.

---

## 3. Source for the 2% to 5% free-to-paid conversion rule

**Verdict: keep it, but reword and label it an assumption.** Do not present "2% to 5%" as a measured fact.

**Best source:** First Page Sage, *SaaS Freemium Conversion Rates* (data from 80+ SaaS clients, updated 2026). Traditional freemium converts free users to paid at **3.7% on average**, with variation by industry from 2.6% (EdTech) to 5.8% (RegTech).
- Primary: https://firstpagesage.com/seo-blog/saas-freemium-conversion-rates/
- Summary with the industry range: https://userpilot.com/blog/freemium-saas/

**Suggested wording:** "Typical freemium conversion is about 3.7% (First Page Sage, SaaS benchmarks). We assume 3.7% and will measure our own."

**Why it needs a caveat**
- These are software-subscription benchmarks. Yours is a one-off £4.99 purchase after a personalised free preview, so it is not directly comparable. It could convert higher or lower. Nobody has measured it.
- The ChartMogul 2026 report gives a median of 8% across 200 software products, but says very few products are actually near 8%, so do not quote 8% as typical.
- Some quoted ranges ("2% to 5%") come from secondary blog posts. The 3.7% is the figure I could trace to the primary report.
- **I searched for one-off paid-report benchmarks and found none.** What I did find: a product-newsletter source says freemium conversion can range from under 1% to about 20% depending on the business (https://personal-learnings.pages.dev/reading_room/issues/lennys_newsletter/0348_what-is-good-free-to-paid-conversion.html), and a newsletter benchmark says free-to-paid is typically under 5%, often under 1% per visit (https://humblytics.com/blog/free-to-paid-newsletter-conversion-rate). Both are secondary sources about different products.
- **Measure it correctly:** count people who see their verdict preview and then pay, not website visitors.

---

## 4. What this changes in earlier numbers

My earlier first-100-customers plan used a £14 price and a 5% conversion rate. Both were my guesses. Your `idea.md` price is £4.99, and 5% is the top of the usual range. Replace with:

- **Free previews needed for 100 paying customers at 3.7%:** about 2,700 (100 ÷ 0.037). At 330 previews a month that is about 8 months, not 6. The 330 a month is still an unproven assumption.
- **Break-even:** `idea.md` 11c says about 0.9% must pay to cover AI cost on Sonnet 5.5. At 3.7% you have roughly 4 times that cushion. At the low end (2.6%) roughly 3 times.
- **Rough slide 4 sum at 100 paying customers a month** (uses the 11c assumed token costs, to be replaced by the token log): revenue £499. Stripe fees about £27 (1.5% plus 20p a sale). AI cost about £123 (27 free users per payer at 4.4p each, plus 4p for the paid second call). Running costs £20. **Profit about £329 a month.** Treat as an illustration, not a forecast.
- **Sensitivity (100 paying customers a month, same assumptions):**

| True conversion | Free users needed | Rough monthly profit |
|---|---|---|
| 1% | 10,000 | about £8 |
| 3.7% | about 2,700 | about £329 |
| 10% | 1,000 | about £404 |

  At about 1% you barely cover AI cost on Sonnet 5.5. A cheaper model for the free steps (Haiku is about 0.2p per person in 11c) changes this a lot.
- The point for judges: unit economics work, but absolute revenue is small. See section 1.

---

## 5. Things I could not verify

- Whether the 3.7% applies to a one-off paid report. I searched specifically for one-off paid-report benchmarks and found none. Treat 3.7% as an assumption until you measure it.
- The number of North East people considering starting a business (no source found).
- ONS figures are rounded to the nearest thousand, so "9,000" could be 8,500 to 9,500.
