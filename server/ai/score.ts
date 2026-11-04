// Lane D (Khaliq). Turns the model's 0-100 score values into words.
// The browser never sees the numbers (ratings are words only, idea.md 11b).

import type { Rating } from "../../src/types/roadmap.js";

/**
 * Bands, highest first. These must match the bands described in prompts/plan-call-1.md.
 * Proposed by Lane D; change both places together.
 */
export const RATING_BANDS: { min: number; rating: Rating }[] = [
  { min: 75, rating: "Strong" },
  { min: 55, rating: "Promising" },
  { min: 35, rating: "Needs work" },
  { min: 0, rating: "Not viable yet" },
];

export function ratingFromValue(value: number): Rating {
  for (const band of RATING_BANDS) {
    if (value >= band.min) return band.rating;
  }
  return "Not viable yet";
}

/**
 * George's weighted-down overall score (score-algorithm.md): a power mean with
 * p = -20, so one weak score drags the overall down hard.
 *   90 90 90 100 -> 91.1     100 100 100 10 -> 10.7     80 80 80 80 -> 80
 * Inputs are clamped to at least 1 to avoid dividing by zero.
 */
export function combinedScore(scores: number[], p = -20): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, x) => acc + Math.max(x, 1) ** p, 0);
  return (sum / scores.length) ** (1 / p);
}
