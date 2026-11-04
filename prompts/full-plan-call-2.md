The person has paid for their full plan. You already gave them scores, risks, improvements and a roadmap (in <plan_so_far>). Now write the improved business plan: the best realistic version of this business within its niche, assuming they make the improvements.

<user_answers>
{{INTAKE_ANSWERS_JSON}}
</user_answers>

<follow_up_answers>
{{FOLLOW_UP_ANSWERS_JSON}}
</follow_up_answers>

<plan_so_far>
{{PLAN_CALL_1_JSON}}
</plan_so_far>

<verified_local_support>
{{VERIFIED_LOCAL_SUPPORT_JSON}}
</verified_local_support>

# What to write

- Build on the improvements and roadmap. Do not contradict the scores or quietly drop any risk.
- Make it the strongest version that is still realistic for this person's budget, weekly hours and skills. Do not upgrade it into a different, bigger business.
- If any score was "Not viable yet", write the improved version that could become viable, and say clearly in "mustBeTrue" what has to be true first.
- All money figures are rough estimates in whole pounds, as ranges. Say where the person should check real prices. Do not invent market sizes, statistics or competitor names.
- Show the pricing working in plain words using the person's own numbers where they gave them, and mark anything you assumed with "(assumed)".
- "stopSignals" are honest signs that it is time to change course or stop. Always include at least two.
- Only mention local support copied exactly from <verified_local_support>.

# Word limits

- Titles: at most 8 words.
- "working" and "breakEven": at most 60 words each.
- Every other text field: at most 35 words.
- Lists: 2 to 5 items each.

# Output shape

Return exactly this JSON shape:

{
  "positioning": {
    "niche": "string, the specific corner of the market to own",
    "customer": "string, who the first customers are, described plainly",
    "whyYou": "string, why someone would choose this over the alternatives"
  },
  "offer": [ { "title": "string", "detail": "string" } ],
  "pricing": {
    "approach": "string",
    "working": "string, the sum in plain words, assumptions marked"
  },
  "findingCustomers": [ { "title": "string", "firstAction": "string", "costGBP": { "min": integer, "max": integer } } ],
  "money": {
    "startupCosts": [ { "item": "string", "costGBP": { "min": integer, "max": integer } } ],
    "monthlyCosts": [ { "item": "string", "costGBP": { "min": integer, "max": integer } } ],
    "breakEven": "string, roughly how many sales a month cover the monthly costs, with the working"
  },
  "runningIt": [ { "title": "string", "detail": "string" } ],
  "milestones": [ { "by": "string, e.g. \"Week 4\" or \"Month 3\"", "goal": "string", "measure": "string, how they know they hit it" } ],
  "mustBeTrue": [ "string" ],
  "stopSignals": [ "string" ],
  "risksAndResponses": [ { "risk": "string", "response": "string" } ]
}
