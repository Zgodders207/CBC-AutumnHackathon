// Lane D (Khaliq). Live smoke test against the real API. Costs a few pence per run.
// Needs ANTHROPIC_API_KEY (and optionally CLAUDE_MODEL) in .env.
//
//   npx tsx --env-file=.env server/ai/try-live.ts                    # built-in fictional idea
//   npx tsx --env-file=.env server/ai/try-live.ts my-idea.json       # PlanInput JSON (fictional only)
//   npx tsx --env-file=.env server/ai/try-live.ts my-idea.json --paid  # also runs call 2
//
// Follow-up questions are auto-answered "Not sure", which is the hardest case for the prompt.

import { readFileSync } from "node:fs";
import { NOT_SURE, type FollowUpAnswer, type PlanInput } from "../../src/types/roadmap.js";
import { AiError, generateFollowUpRound, generateImprovedPlan, generatePlan, getCostSummary, toPreview } from "./index.js";

const args = process.argv.slice(2);
const paid = args.includes("--paid");
const file = args.find((a) => !a.startsWith("--"));

const input: PlanInput = file
  ? JSON.parse(readFileSync(file, "utf8"))
  : {
      intake: {
        idea: "Mobile bike repair, coming to people's homes and workplaces",
        customer: "Commuters and families",
        howItMakesMoney: "Charge per repair",
        budget: "£300",
        hoursPerWeek: "6",
        skills: "Fixed my own and friends' bikes for years",
        stage: "Just an idea",
        location: "Gateshead",
      },
      followUps: [],
      verifiedLocalSupport: [],
    };

const session = `live-${Date.now()}`;
const show = (label: string, value: unknown) => console.log(`\n=== ${label} ===\n${JSON.stringify(value, null, 2)}`);

async function main() {
  const followUps: FollowUpAnswer[] = [...input.followUps];
  const fu = await generateFollowUpRound({ intake: input.intake, followUps, round: 1, maxRounds: 1 }, { sessionId: session });
  show(`Follow-up round 1 (business type: ${fu.businessType})`, fu.round);
  for (const q of fu.round.questions) followUps.push({ round: 1, id: q.id, question: q.text, answer: NOT_SURE });

  const sp = await generatePlan({ ...input, followUps }, { sessionId: session, businessType: fu.businessType });
  show("Free preview (what the browser gets before payment)", toPreview(sp));
  show("Internal numbers (server only)", sp.internal);
  show("Paid: improvements and roadmap", { improvements: sp.plan.improvements, roadmap: sp.plan.roadmap });

  if (paid) show("Paid: improved business plan (call 2)", await generateImprovedPlan({ ...input, followUps }, sp, { sessionId: session }));

  show("Cost summary", getCostSummary());
}

main().catch((err) => {
  if (err instanceof AiError) console.error(`\nAiError [${err.code}]: ${err.message}`, err.cause ?? "");
  else console.error(err);
  process.exit(1);
});
