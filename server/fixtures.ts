// Lane E test fixtures: fictional canned model replies, copied from server/ai/selftest.ts (Lane D).
// Fictional persona only. Keep in step with the engine's schemas.
import { NOT_SURE, type PlanInput } from "../src/types/roadmap.js";

export const input: PlanInput = {
  intake: {
    idea: "Mobile bike repair, coming to people's homes",
    customer: "Commuters and families",
    howItMakesMoney: "Charge per repair",
    budget: "£300",
    hoursPerWeek: "6",
    skills: "Fixed my own bikes for years",
    stage: "Just an idea",
    location: "Gateshead",
  },
  followUps: [{ round: 1, id: "r1q1", question: "What would you charge for a puncture repair?", answer: NOT_SURE }],
  verifiedLocalSupport: [{ name: "Example Verified Hub", whatItOffers: "Free start-up workshops", link: "https://example.org" }],
};

export const followUpReply = {
  businessType: "services",
  enough: false,
  reason: "Need pricing and demand evidence.",
  questions: [
    { id: "r1q1", text: "Has anyone said they would pay?", why: "Shows demand.", type: "choice", options: ["Yes", "No", "Not sure"] },
    { id: "r1q1", text: "Roughly what would you charge?", why: "Checks the numbers.", type: "choice", options: ["£10"] },
    { id: "r1q3", text: "q3", why: "", type: "text", options: [] },
    { id: "r1q4", text: "q4", why: "", type: "text", options: [] },
    { id: "r1q5", text: "q5", why: "", type: "text", options: [] },
    { id: "r1q6", text: "q6 should be cut", why: "", type: "text", options: [] },
  ],
};

export const planReply = {
  summary: { idea: "Mobile bike repair at people's homes in Gateshead.", place: "Gateshead", basedOn: "Based on 6 hours a week and a £300 budget." },
  scores: {
    financialStability: { value: 62, reason: "Low start-up costs, but prices are untested." },
    longTermSustainability: { value: 70, reason: "Bikes always need fixing." },
    roomInMarket: { value: 48, reason: "Shops nearby already offer repairs." },
    skillsAndAbility: { value: 140, reason: "Strong hands-on experience." }, // out of range on purpose
  },
  overallReason: "Demand and pricing are unproven.",
  topRisks: [{ title: "Demand may be seasonal", detail: "Fewer repairs in winter." }],
  otherRisks: [
    { title: "Travel time", detail: "Travel eats into 6 hours a week." },
    { title: "Insurance", detail: "Working in people's homes needs cover." },
  ],
  improvements: {
    financialStability: [{ title: "Set a price list", why: "Untested prices.", cheapCheck: "Ask 10 cyclists." }],
    longTermSustainability: [{ title: "Add servicing plans", why: "Repeat income.", cheapCheck: "Offer to 5 people." }],
    roomInMarket: [{ title: "Target workplaces", why: "Shops don't come to you.", cheapCheck: "Ask two employers." }],
    skillsAndAbility: [],
  },
  roadmap: [
    { title: "Test demand cheaply", firstStep: "Post in local groups.", cheapTest: "Take 5 bookings.", costGBP: { min: 0, max: 0 }, weeks: { min: 1, max: 2 }, hoursPerWeek: 4, goSignal: "5 bookings." },
    { title: "First paying customers", firstStep: "Buy a basic kit.", cheapTest: "Do 10 repairs.", costGBP: { min: 150, max: 80 }, weeks: { min: 4, max: 6 }, hoursPerWeek: 12, goSignal: "10 paid repairs." },
  ],
  professionalAdvice: [{ topic: "Insurance", why: "You work in people's homes.", whoToAsk: "an insurance broker" }],
  localSupport: [
    { name: "example verified hub", whatItOffers: "made up by model", link: "https://wrong.example" },
    { name: "Invented Enterprise Fund", whatItOffers: "Grants", link: "https://invented.example" },
  ],
  assumptions: ["Price per repair is about £15 (you said Not sure)."],
  limits: ["I can't check how many mobile repairers already work in Gateshead."],
};

export const improvedReply = {
  positioning: { niche: "Workplace bike repair", customer: "Commuters", whyYou: "Comes to them." },
  offer: [{ title: "Puncture fix", detail: "At your workplace." }],
  pricing: { approach: "Flat prices", working: "£15 x 10 = £150 (assumed)." },
  findingCustomers: [{ title: "Employers", firstAction: "Email two", costGBP: { min: 0, max: 0 } }],
  money: { startupCosts: [{ item: "Tool kit", costGBP: { min: 80, max: 150 } }], monthlyCosts: [], breakEven: "About 6 repairs a month." },
  runningIt: [{ title: "Bookings", detail: "Use a free form." }],
  milestones: [{ by: "Week 4", goal: "10 repairs", measure: "Count them." }],
  mustBeTrue: ["People will pay £15."],
  stopSignals: ["Fewer than 3 bookings in a month.", "Travel costs more than you earn."],
  risksAndResponses: [{ risk: "Winter dip", response: "Offer servicing plans." }],
};

