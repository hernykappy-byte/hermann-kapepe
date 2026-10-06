// Personal stats kept on this device only. Every access is wrapped: storage can be
// blocked (private windows, strict settings) and the game must still play.
import { dayDiff, lusakaDay } from "./daily";
import type { FinishResponse, StartResponse, AnswerResponse } from "./types";

const KEY = "grrand:v3";

export type DailyResult = { points: number; correct: number; total: number; grid: ("hit" | "miss")[] };
export type PlayLog = { cat: string; ts: number };

export type ActiveRound = {
  start: StartResponse;
  token: string;
  i: number;
  phase: "shown" | "answered";
  shownAt: number;
  answers: (AnswerResponse & { picked: number })[];
  savedAt: number;
};

export type Local = {
  seen: string[];
  plays: PlayLog[];
  daily: Record<string, DailyResult>;
  rounds: number;
  points: number;
  best: number;
  correct: number;
  answered: number;
  perfects: number;
  active: ActiveRound | null;
};

const EMPTY: Local = { seen: [], plays: [], daily: {}, rounds: 0, points: 0, best: 0, correct: 0, answered: 0, perfects: 0, active: null };

export function load(): Local {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY, seen: [], plays: [], daily: {} };
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<Local>) };
  } catch {
    return { ...EMPTY, seen: [], plays: [], daily: {} };
  }
}

function save(s: Local) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable: play continues without saving */
  }
}

export function recentPlays(s: Local, cat: string, now = Date.now()): number {
  const week = 7 * 24 * 3600 * 1000;
  return s.plays.filter((p) => p.cat === cat && now - p.ts < week).length;
}

export function streak(s: Local, today = lusakaDay()): number {
  const days = Object.keys(s.daily).sort();
  if (!days.length) return 0;
  const last = days[days.length - 1];
  if (dayDiff(last, today) > 1) return 0; // missed a day
  let n = 1;
  for (let i = days.length - 1; i > 0; i--) {
    if (dayDiff(days[i - 1], days[i]) === 1) n++;
    else break;
  }
  return n;
}

export function recordRound(f: FinishResponse): Local {
  const s = load();
  s.rounds += 1;
  s.points += f.points;
  s.best = Math.max(s.best, f.points);
  s.correct += f.correct;
  s.answered += f.total;
  if (f.correct === f.total) s.perfects += 1;
  s.seen = [...s.seen.filter((id) => !f.questionIds.includes(id)), ...f.questionIds].slice(-600);
  if (f.mode === "category" && f.category) s.plays = [...s.plays, { cat: f.category, ts: Date.now() }].slice(-200);
  if (f.mode === "daily" && f.day) s.daily[f.day] = { points: f.points, correct: f.correct, total: f.total, grid: f.grid };
  s.active = null;
  save(s);
  return s;
}

export function setActive(a: ActiveRound | null) {
  const s = load();
  s.active = a;
  save(s);
}

export function wipe() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to do */
  }
}
