import type { Diff } from "./bank";

// Scoring follows Kahoot's published model: speed only trims a correct answer's value
// (never below half), there is no streak bonus, and team scores are averages.
// Source: support.kahoot.com "How points work".

export const LIMIT_SEC = 20;
export const ROUND_SIZE = 5;
export const GRACE_MS = 400; // allowance for network latency, taken off measured time
export const INSTANT_MS = 500; // answers faster than this earn full value
export const PERFECT_BONUS = 500;

export const BASE: Record<Diff, number> = { E: 600, M: 800, H: 1000 };

export function answerPoints(diff: Diff, correct: boolean, elapsedMs: number): number {
  if (!correct) return 0;
  const limitMs = LIMIT_SEC * 1000;
  const t = Math.max(0, elapsedMs);
  if (t < INSTANT_MS) return BASE[diff];
  const factor = 1 - 0.5 * Math.min(1, t / limitMs);
  return Math.round(BASE[diff] * factor);
}

// Playing the same category again within a week is worth less, which nudges players to
// try new categories. The daily round is always full value.
export const FRESHNESS = [1, 0.6, 0.4, 0.2];
export function freshnessMultiplier(recentPlaysOfCategory: number): number {
  const n = Math.max(0, Math.floor(recentPlaysOfCategory));
  return FRESHNESS[Math.min(n, FRESHNESS.length - 1)];
}
