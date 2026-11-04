# Data sources for investor mode and location-specific results

Research summary for Eric (Lane B). Compiled 4 Nov 2026 by George's Claude session. Research only: nothing here has been built.

Rules this respects: every figure has a link; anything not verified is marked **UNVERIFIED**; the demo uses fictional businesses and numbers only; real figures are background, labelled with source and date; nothing here is financial advice and the tool must not promise returns or say buy/sell.

## Short answer

- **No free source ranks VC-backed companies by success.** The nearest are paid (Beauhurst, Crunchbase) or free reports with summary figures only.
- **Best option 1 (usable on the day):** ONS Business Demography, ONS UK Business Counts and Companies House free data. All are open government data under the Open Government Licence (OGL) v3.0, so they can be shown in the app with a source line. They give base rates and local market counts, not VC outcomes.
- **Best option 2 (comparison panel):** Beauhurst's free published research (fail / scale / exit rates, North East report). Quote with attribution. Beauhurst's reuse terms were **not checked**, so treat as pitch and mockup material until someone reads them.
- **Academic evidence** (Gompers et al.) supports a "founder track record" red-flag question and needs no data licence.
- **If none is practical:** drop the claim "compared against real VC patterns". Keep red flags and founder questions as a rule-based checklist and label any base rate as general context.

## A. Outcome and base-rate sources

### ONS Business Demography, UK: 2024 (use in build)
- Contains: annual UK business births, deaths and survival by region and industry. Released 20 Nov 2025.
- Success measure: survival only. Five-year survival of businesses born in 2019: **38.4%** UK; highest region South West 43.5%; lowest West Midlands 30.6%. No North East survival figure on the page.
- North East: 9,000 births (11.8%), 8,000 deaths (10.3%), 77,000 active businesses, 425 high-growth (4.7%).
- Licence: OGL v3.0. Free download.
- Bias: all businesses, not VC-backed. Survival is not profit.
- Link: https://www.ons.gov.uk/businessindustryandtrade/business/activitysizeandlocation/bulletins/businessdemography/latest

### Companies House free data products (use in build)
- Contains: monthly CSV snapshot of live companies, XBRL accounts files (about 60% of the 2.2 million filed each year), PSC (owners) JSON file.
- Success measure: none. Confirms a company exists, its age, filed accounts.
- Access: free bulk download, ready within 5 working days of month end. Paid XML gateway: £4.70 a month plus per-item charges. REST API: 600 requests per 5 minutes per app; **UNVERIFIED whether the REST API is free.**
- Licence: OGL v3.0 "except where otherwise stated"; Companies House imposes no rules on use of register information.
- Links: https://www.gov.uk/guidance/companies-house-data-products · https://developer-specs.company-information.service.gov.uk/guides/rateLimiting

### Beauhurst free research (pitch and mockup figures)
- "Startup Fail, Scale & Exit Rates in the UK" (15 Sep 2022). Sample: 2,582 private UK companies incorporated 2017, at Seed stage, each hitting at least one Beauhurst tracking trigger. Within five years: 23% scaled, 20% failed, 2% exited (52 companies), 54% stagnated. Scale = reached a later stage; fail = reached Zombie or Dead status; exit = acquisition or IPO.
- North East free report: "£467m+" investment, "87+" funders, "270+" high-growth companies. No date; unclear if equity only.
- API: paid and quote-based. One G-Cloud listing (Sep 2025): 10,000 credits a year at £3,500 plus VAT, minimum 10 users, 12 months. Another page says the API can be bought without a platform subscription (may be out of date).
- Licence: **not checked.**
- Bias: vendor marketing; only companies Beauhurst tracks, so startups that fail before a first round are excluded. Its own wording: the 2011-cohort failure rate rises to 21% if zombies are counted. The analysis links its period to COVID-19.
- Links: https://www.beauhurst.com/blog/startup-fail-scale-exit/ · https://www.beauhurst.com/high-growth-in-the-north-east · https://about.beauhurst.com/api/ · https://www.beauhurst.com/pricing/

### Gompers, Kovner, Lerner, Scharfstein (2010) (use as logic, not data)
- "Performance Persistence in Entrepreneurship", Journal of Financial Economics 96(1): 18-32. NBER working paper 12592 is the open version.
- Per a secondary summary: founders with a prior success had a 30% success rate vs 18% for first-time founders and 20% for founders of a prior failure.
- Bias: US venture-backed companies, earlier period, success defined by IPO. **Paper itself not read; check numbers and definition before quoting.**
- Links: https://econpapers.repec.org/RePEc:nbr:nberwo:12592 · https://econpapers.repec.org/RePEc:eee:jfinec:v:96:y:2010:i:1:p:18-32

## B. Location-specific data (council + sector)

Idea: user picks a council and a sector; the tool shows local business counts, local births/survival and a competitor count as background next to the fictional business's own rating. Suggested shortcut: a dropdown of councils, not a postcode box (no postcode-to-council lookup was verified). The North East Combined Authority hub lists seven councils: Durham, Gateshead, Newcastle, North Tyneside, Northumberland, South Tyneside, Sunderland. The ONS "North East" region may include more; the team must pick a list.

### ONS UK Business: Activity, Size and Location (use in build)
- Enterprises and local units from the Inter-Departmental Business Register (snapshot 13 Mar 2026), by region, local authority district and constituency, with industry at 2-digit and 4-digit SIC. 2026 edition dated 24 Sep 2026. Excel workbook (1.0 MB). OGL v3.0.
- Bias: register holds businesses registered for VAT and/or PAYE, so very small sole traders can be missing. Counts existence, not performance.
- Link: https://www.ons.gov.uk/businessindustryandtrade/business/activitysizeandlocation/datasets/ukbusinessactivitysizeandlocation

### Nomis (use in build)
- Same business counts at finer detail (to small neighbourhood areas, 2010 onwards, per a search summary), plus Census 2021 industry employment by local authority (as at 21 Mar 2021).
- Free API; key optional. Guest downloads capped at 25,000 cells; concurrent requests limited, no figures published; no request-rate limit stated.
- Licence: copyright page says OGL, commercial reuse allowed, credit "Source: Office for National Statistics"; third-party material excluded; Business Register and Employment Survey data has extra restrictions. The API help page states no licence.
- Note: a Nomis news item mentions new 2025 figures (14 Oct 2025) while ONS shows a 2026 edition. Check the date before quoting.
- Links: https://www.nomisweb.co.uk/api/v01/help · https://www.nomisweb.co.uk/home/copyright.asp

### Local births, deaths and survival (partly verified)
- ONS Business demography 2024 has one dataset "by geographical area" and SIC group. **UNVERIFIED that it reaches council level.**
- North East Combined Authority hub (ONS-sourced, North East): "Around 3 out of 4 new business survive the first two years", "4 out of 10 by five years"; businesses born in 2020 were 6 percentage points lower than 2019. CSV download; data dated 27 Nov 2023, updated 7 Jul 2025; no licence stated, so credit ONS.
- A South Tyneside council blog (May 2025) says its survival was below the North East and England in every year shown. **No figures found for Newcastle, Gateshead, Sunderland or Durham.**
- Links: https://www.ons.gov.uk/releases/businessdemography2024 · https://evidencehub.northeast-ca.gov.uk/report/survival-rate-of-new-businesses · https://data.southtyneside.gov.uk/monthly-economic-monitor-blog-may-2025/

### Food Standards Agency hygiene ratings API (use in build, food and drink only)
- Every rated food business (restaurants, pubs, cafés, takeaways, hotels, food shops) with local authority, business type, latitude and longitude. Updated daily. Free, no registration; XML or JSON; up to 5,000 results per page; downloads by region and by local authority.
- Licence: "terms and conditions apply" and rating images must follow the FHRS brand standard. **Terms not read; no licence named.**
- Bias: food businesses only; closed businesses may linger until the council updates.
- Link: https://ratings.food.gov.uk/open-data

### OpenStreetMap (possible, check terms)
- Nearby shops and services for other sectors. ODbL: commercial use allowed, credit "© OpenStreetMap" required; share-alike for apps combining data is debated (wiki and forum sources, not legal advice). Overpass limits **not checked**. Coverage varies by street.
- Link: https://osmfoundation.org/wiki/Licence_and_Legal_FAQ

### Local demand and spending (mostly a gap)
- Regional only: the NECA hub says North East households spent about 83% of the UK average on weekly expenditure in the year ending March 2021, with food a larger share. Secondary page, old; ONS Family Spending not opened.
- **No open source found for footfall, rents or household spending by council.** The tool should say so, not invent one.
- Link: https://evidencehub.northeast-ca.gov.uk/cost-of-living-household-spending/

### Local investment context (pitch only, investor mode)
- North East: 58 equity deals in 2023, down 23% on 2022. 66% of equity investors in North East businesses were also North East based (behind London 90% and Scotland 81%). Both from search summaries, not the Business Bank pages (which returned 403). Northern Powerhouse Investment Fund II (£660m, launched March 2024) covers the whole North East for the first time.
- Link: https://www.finextra.com/newsarticle/38984/british-business-bank-finds-external-finance-used-by-more-than-four-in-ten-businesses-in-uk

## C. Pitch mentions only

- **UK Private Capital (formerly BVCA) Report on Investment Activity.** 2025 edition published 5 May 2026, Excel chartbook and data pack. 57% of businesses receiving private capital in 2025 were outside London. Divestments surveyed but no exit figures on the page; fund returns are in a separate Performance Measurement Survey (no download found). No licence stated. Member-submitted, mostly buyouts and larger deals. https://www.ukprivatecapital.co.uk/research/investment-activity.html
- **British Business Bank Small Business Equity Tracker.** Annual, regional splits, 2026 edition is the twelfth. Counts deals and amounts, not outcomes. 2024-26 North East numbers **UNVERIFIED** (page returned 403). https://www.british-business-bank.co.uk/about/research-and-publications/small-business-equity-tracker-2026
- **HMRC EIS and SEIS statistics.** 2024-25 via the trade body EISA: 3,735 companies raised £1,575m under EIS; 2,430 raised £276m under SEIS. Funding volumes only. **Not verified from HMRC directly.** https://www.eisa.org.uk/?p=2753
- **UKRI Gateway to Research.** About 170,000 publicly funded projects since 2006 including Innovate UK grants; public API, no login (per UKRI guide and third-party notes). Funded value is a commitment, not spend. OGL per secondary sources, not checked. https://www.ukri.org/publications/gateway-to-research-guide/a-guide-to-gateway-to-research/
- **Crunchbase (not practical).** Third-party reviews say the free API tier is gone and Enterprise/Applications licences are quoted from about $30,000 to $50,000 a year; display rights depend on the licence. **UNVERIFIED**; only third-party pages found. https://support.crunchbase.com/hc/en-us/articles/32319290128019-Crunchbase-API-FAQ

## D. What the VC outcome figures really say

- Correlation Ventures (secondary summaries only): about 21,000 financings 2004-2013, 64% lost money; by dollars, 51% lost money and under 4% returned 10x or more. Original not opened. **UNVERIFIED**, US-based.
- Mason (2002), business angels not VC funds: 34% of exits were a total loss. https://strathprints.strath.ac.uk/id/eprint/4239
- Kaplan and Sensoy (2015): VC fund performance persisted after 2000 while buyout persistence declined. Abstract-level only; about funds, not companies. https://ideas.repec.org/a/anr/refeco/v7y2015p597-614.html
- Survivorship bias runs through all of these: winners are visible and failures drop out of databases. Beauhurst's own indicators article admits its comparisons are correlational and its success measure is survival, not returns.

## E. Limits to show in the tool

- Small areas have small counts, so rates swing; show counts next to any percentage.
- Open data covers business counts, births, deaths and competitors. It does not cover local demand, rents or footfall, and gives no VC outcomes for any area.
- Reading the ONS Excel file in Python needs a library such as openpyxl; exporting to CSV first lets the team use only the standard CSV reader. Take that to the team (no new libraries without agreement).

## F. Not verified / not researched

- Companies House REST API price and terms; Business Bank 2024-26 North East figures; Beauhurst and UK Private Capital reuse terms; HMRC regional tables; the original Correlation Ventures post; full text of the Gompers and Kaplan papers.
- Council-level ONS demography tables; council-level survival for Newcastle, Gateshead, Sunderland, Durham; FHRS terms text; Overpass limits; Nomis rate limits; postcode-to-council lookup.
- Not researched: Dealroom, PitchBook, Startup Genome, Kauffman data.
- No "Beauhurst Deadpool report" was found, so it was not used.

## G. Notes for the team

- The demo business and its location stay fictional. Real local figures appear only as labelled background, e.g. "UK five-year survival 38.4% (ONS, 2019 cohort)".
- The lean-invest / lean-pass view must state the base rate as general context, promise no returns and give no buy/sell instruction. Not financial advice.
- Investor mode is currently marked as not in today's build (PR #2), so this is for the pitch and future direction unless Zac changes that.
