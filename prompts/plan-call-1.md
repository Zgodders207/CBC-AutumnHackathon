Write the person's plan: four honest scores, the top risks, the improvements to make before they start, and a roadmap of cheap first steps.

<user_answers>
{{INTAKE_ANSWERS_JSON}}
</user_answers>

<follow_up_answers>
{{FOLLOW_UP_ANSWERS_JSON}}
</follow_up_answers>

<verified_local_support>
{{VERIFIED_LOCAL_SUPPORT_JSON}}
</verified_local_support>

# Scores

Score each of these four from 0 to 100, where higher is always better for the person:

- "financialStability": can the money work, and could it survive a slow start?
- "longTermSustainability": will it still make sense in a few years?
- "roomInMarket": is there space for it? High means plenty of room; low means already crowded.
- "skillsAndAbility": does this person have the skills, time and means to actually run it?

The app turns each value into a word, so use these bands:

- 75 to 100, "Strong": clear evidence in the answers that this works. Not just that it sounds nice.
- 55 to 74, "Promising": could work, but something important is still unproven.
- 35 to 54, "Needs work": a real problem that must be fixed before spending money.
- 0 to 34, "Not viable yet": cannot work as described with this budget, time or market.

Be strict. With no evidence that anyone would pay, "roomInMarket" and "financialStability" are at most 70. Use the whole range; do not cluster everything in the middle.

Each score has a "reason": one sentence on why, at most 25 words. Never put a number or a rating word in a reason.

The overall rating is worked out by our code and is pulled down hard by the weakest score. Write "overallReason" (at most 30 words) about what most holds the business back, or, if all scores are high, what it most depends on. Do not name a rating word.

# Risks

"topRisks" are the two most serious reasons it might not work. They are shown for free, so never hold back the worst risk for later. Put any other risks in "otherRisks" (at most 4).

# Improvements

For each of the four scores, give 1 to 3 improvements, most important first. Each one says what to change, why, and how to check it cheaply. They must fit the person's budget and hours.

# Roadmap

Give 3 to 6 steps, in order. The first step must cost nothing or close to nothing and test whether people will pay. Later steps only spend money once an earlier step has shown it is worth it. The last step is a decision: carry on, change the idea, or stop.

- Costs are whole pounds, as a rough range. Use 0 for free.
- The sum of every step's "max" cost should stay within the stated budget. If it can't, say so in the "financialStability" improvements.
- "hoursPerWeek" must not exceed the person's stated weekly hours.
- "goSignal" is the result that means it is worth moving to the next step.

# Professional advice

List the areas where they should get proper advice before starting (for example tax and registering as self-employed, insurance, licences, contracts). Name the kind of adviser in general terms only.

# Local support

Only include entries copied exactly from <verified_local_support> (same name and link), and only if relevant. If none are relevant or the list is empty, return [].

# Assumptions and limits

"assumptions" lists what you assumed, especially for "Not sure" answers, so the person can correct you. "limits" lists what you could not know (for example current local prices, local rules, how many competitors there really are) and how they could check.

# Word limits

- Titles: at most 8 words.
- Every other text field: at most 30 words unless stated above.

# Output shape

Return exactly this JSON shape:

{
  "summary": {
    "idea": "string, the business restated in one plain sentence, at most 20 words",
    "place": "string, the town or area they gave, or \"North East\" if none",
    "basedOn": "string, e.g. \"Based on 6 hours a week and a £300 budget.\""
  },
  "scores": {
    "financialStability":     { "value": integer 0-100, "reason": "string" },
    "longTermSustainability": { "value": integer 0-100, "reason": "string" },
    "roomInMarket":           { "value": integer 0-100, "reason": "string" },
    "skillsAndAbility":       { "value": integer 0-100, "reason": "string" }
  },
  "overallReason": "string",
  "topRisks":   [ { "title": "string", "detail": "string" } ],
  "otherRisks": [ { "title": "string", "detail": "string" } ],
  "improvements": {
    "financialStability":     [ { "title": "string", "why": "string", "cheapCheck": "string" } ],
    "longTermSustainability": [ { "title": "string", "why": "string", "cheapCheck": "string" } ],
    "roomInMarket":           [ { "title": "string", "why": "string", "cheapCheck": "string" } ],
    "skillsAndAbility":       [ { "title": "string", "why": "string", "cheapCheck": "string" } ]
  },
  "roadmap": [
    {
      "title": "string",
      "firstStep": "string",
      "cheapTest": "string",
      "costGBP": { "min": integer, "max": integer },
      "weeks": { "min": integer, "max": integer },
      "hoursPerWeek": integer,
      "goSignal": "string"
    }
  ],
  "professionalAdvice": [ { "topic": "string", "why": "string", "whoToAsk": "string, a kind of adviser, never a named organisation" } ],
  "localSupport": [ { "name": "string", "whatItOffers": "string", "link": "string" } ],
  "assumptions": [ "string, at most 20 words" ],
  "limits": [ "string, at most 25 words" ]
}

"topRisks" must contain exactly 2 items.
