The person has started telling us about their business. Your task: decide what type of business it is, decide whether we know enough to give an honest verdict, and if not, write the next round of follow-up questions.

This is follow-up round {{ROUND_NUMBER}} of at most {{MAX_ROUNDS}}.

<user_answers>
{{INTAKE_ANSWERS_JSON}}
</user_answers>

<follow_up_answers>
{{FOLLOW_UP_ANSWERS_JSON}}
</follow_up_answers>

# Business type

Place the business in exactly one type. The person never sees this; it only steers your questions. Re-check it every round and change it if the answers point elsewhere.

- "retail": selling physical products (shop, market stall, online shop, food and drink sold to take away).
- "saas": software sold on subscription or licence.
- "services": professional services or freelance work sold by the hour, day or job.
- "other": anything that does not clearly fit the three above.

# What we will rate

The verdict rates four things, so ask what would most change these:

1. Financial stability: can the money work, and could it survive a slow start?
2. Long-term sustainability: will it still make sense in a few years?
3. Room in the market: is there space for it, or is it already crowded?
4. Skills and ability: does this person have the skills, time and means to run it?

Useful questions by type (write your own from their answers; these are only examples of topics):
- retail: stock costs and margins, where they will sell, premises or pitch fees, seasonality.
- saas: who pays and how much, build cost and time, how customers will find it, who already does this.
- services: day or hourly rate, how they will find the first clients, how many hours they can actually sell.
- other: who pays, what it costs to deliver, what they have already tried.

For any type, also consider: has anyone said they would pay, and anything that may need a licence, insurance or registration (food, childcare, alcohol, vehicles, health, working in people's homes).

# Rules for questions

- Never repeat a question that is already answered, including in earlier rounds.
- If an earlier answer was "Not sure", only ask about it again if it really matters, and make the new question easier to answer.
- Ask at most 5 questions. Fewer is better. Each must be answerable in under a minute on a phone.
- "text": at most 20 words. "why": at most 15 words, telling the person why we ask.
- Use "choice" when there are a few obvious answers (2 to 5 options, each at most 6 words). Otherwise use "text".
- The app always adds a "Not sure" option, so do not include one yourself.
- Never ask for names, addresses, contact details or other personal data.

# When to stop

- Set "enough" to true when the answers so far are enough for an honest view on all four scores. Then "questions" must be [].
- If this is round {{MAX_ROUNDS}}, ask only the questions that matter most. After this round we generate the plan whatever happens.
- Do not keep asking just to be thorough. Gaps can be covered as stated assumptions in the plan.

# Output shape

Return exactly this JSON shape:

{
  "businessType": "retail" | "saas" | "services" | "other",
  "enough": boolean,
  "reason": "string, at most 20 words: why you need more answers, or why you have enough",
  "questions": [
    {
      "id": "string, short and unique, e.g. \"r{{ROUND_NUMBER}}q1\"",
      "text": "string",
      "why": "string",
      "type": "text" | "choice",
      "options": ["string"]
    }
  ]
}

"options" must be [] when "type" is "text".
