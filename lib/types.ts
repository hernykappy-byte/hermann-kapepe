import type { Diff } from "./bank";

export type PublicQuestion = {
  id: string;
  cat: string;
  q: string;
  options: string[]; // already shuffled for this round
  diff: Diff;
};

export type StartRequest = {
  mode: "daily" | "category";
  category?: string;
  seen?: string[]; // question ids the player has seen, oldest first
  recentPlays?: number; // plays of this category in the last 7 days (device-reported)
};

export type StartResponse = {
  token: string;
  mode: "daily" | "category";
  category: string | null; // category id for category rounds
  day: string | null;
  limitSec: number;
  repeats: number; // how many questions in this round the player has seen before
  questions: PublicQuestion[];
};

export type AnswerResponse = {
  token: string;
  correct: boolean;
  timedOut: boolean;
  correctIndex: number; // index in the shuffled options
  fact: string;
  points: number;
  elapsedMs: number;
};

export type NextResponse = { token: string };

export type FinishResponse = {
  correct: number;
  total: number;
  basePoints: number;
  perfectBonus: number;
  freshness: number;
  points: number;
  grid: ("hit" | "miss")[];
  day: string | null;
  category: string | null;
  mode: "daily" | "category";
  questionIds: string[];
};
