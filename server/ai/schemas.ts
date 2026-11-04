// Lane D (Khaliq). JSON schemas for structured outputs (output_config.format), so the API
// itself constrains replies to these shapes. Word limits, counts and number ranges are not
// expressible here; validate.ts checks those after parsing.

type Schema = Record<string, unknown>;

const str: Schema = { type: "string" };
const int: Schema = { type: "integer" };
const strList: Schema = { type: "array", items: str };

/** An object where every property is required and nothing else is allowed. */
function obj(properties: Record<string, Schema>): Schema {
  return { type: "object", properties, required: Object.keys(properties), additionalProperties: false };
}
const list = (items: Schema): Schema => ({ type: "array", items });

const range = obj({ min: int, max: int });
const scoreKeys = ["financialStability", "longTermSustainability", "roomInMarket", "skillsAndAbility"];
const perScore = (s: Schema): Schema => obj(Object.fromEntries(scoreKeys.map((k) => [k, s])));

export const followUpSchema: Schema = obj({
  businessType: { type: "string", enum: ["retail", "saas", "services", "other"] },
  enough: { type: "boolean" },
  reason: str,
  questions: list(
    obj({
      id: str,
      text: str,
      why: str,
      type: { type: "string", enum: ["text", "choice"] },
      options: strList,
    }),
  ),
});

const risk = obj({ title: str, detail: str });

export const planSchema: Schema = obj({
  summary: obj({ idea: str, place: str, basedOn: str }),
  scores: perScore(obj({ value: int, reason: str })),
  overallReason: str,
  topRisks: list(risk),
  otherRisks: list(risk),
  improvements: perScore(list(obj({ title: str, why: str, cheapCheck: str }))),
  roadmap: list(
    obj({
      title: str,
      firstStep: str,
      cheapTest: str,
      costGBP: range,
      weeks: range,
      hoursPerWeek: int,
      goSignal: str,
    }),
  ),
  professionalAdvice: list(obj({ topic: str, why: str, whoToAsk: str })),
  localSupport: list(obj({ name: str, whatItOffers: str, link: str })),
  assumptions: strList,
  limits: strList,
});

const titled = obj({ title: str, detail: str });
const costLine = obj({ item: str, costGBP: range });

export const improvedPlanSchema: Schema = obj({
  positioning: obj({ niche: str, customer: str, whyYou: str }),
  offer: list(titled),
  pricing: obj({ approach: str, working: str }),
  findingCustomers: list(obj({ title: str, firstAction: str, costGBP: range })),
  money: obj({ startupCosts: list(costLine), monthlyCosts: list(costLine), breakEven: str }),
  runningIt: list(titled),
  milestones: list(obj({ by: str, goal: str, measure: str })),
  mustBeTrue: strList,
  stopSignals: strList,
  risksAndResponses: list(obj({ risk: str, response: str })),
});
