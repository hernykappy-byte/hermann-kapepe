import { BANK, BY_ID, CATEGORIES, type Diff, type Question } from "./bank";
import { rngFrom, shuffle } from "./rng";
import { ROUND_SIZE, LIMIT_SEC, GRACE_MS, answerPoints, freshnessMultiplier, PERFECT_BONUS } from "./scoring";
import { lusakaDay } from "./daily";
import { sign, verify } from "./token";
import type { AnswerResponse, FinishResponse, NextResponse, PublicQuestion, StartRequest, StartResponse } from "./types";

// Difficulty ramp: settle in, build, peak, ease off, finish on a win.
// (Duolingo ends sessions on a deliberately easier item.)
const RAMP: Diff[] = ["E", "M", "H", "M", "E"];

export type RoundState = {
  v: 1;
  rid: string;
  mode: "daily" | "category";
  cat: string | null;
  day: string | null;
  qids: string[];
  i: number;
  phase: "shown" | "answered";
  t: number; // server time the current question was shown
  ok: (0 | 1)[];
  pts: number[];
  fresh: number; // freshness multiplier x100
};

const NEAR: Record<Diff, Diff[]> = { E: ["E", "M", "H"], M: ["M", "E", "H"], H: ["H", "M", "E"] };

function pickForRamp(pool: Question[], seen: string[], rnd: () => number): { picked: Question[]; repeats: number } {
  const rank = new Map<string, number>(); // oldest-seen first
  seen.forEach((id, idx) => rank.set(id, idx));
  const used = new Set<string>();
  const picked: Question[] = [];
  let repeats = 0;

  for (const want of RAMP) {
    let choice: Question | undefined;
    for (const d of NEAR[want]) {
      const unseen = shuffle(pool.filter((q) => q.diff === d && !used.has(q.id) && !rank.has(q.id)), rnd);
      if (unseen.length) { choice = unseen[0]; break; }
    }
    if (!choice) {
      // Everything of this difficulty has been seen. Reuse the one seen longest ago.
      for (const d of NEAR[want]) {
        const old = pool
          .filter((q) => q.diff === d && !used.has(q.id))
          .sort((a, b) => (rank.get(a.id) ?? -1) - (rank.get(b.id) ?? -1));
        if (old.length) { choice = old[0]; break; }
      }
      if (choice) repeats++;
    }
    if (choice) { used.add(choice.id); picked.push(choice); }
  }
  return { picked, repeats };
}

export function pickDaily(day: string): Question[] {
  const rnd = rngFrom("daily:" + day);
  const cats = shuffle(CATEGORIES.map((c) => c.id), rnd);
  const out: Question[] = [];
  const used = new Set<string>();
  RAMP.forEach((want, slot) => {
    const cat = cats[slot % cats.length];
    const pool = BANK.filter((q) => q.cat === cat && !used.has(q.id));
    for (const d of NEAR[want]) {
      const c = shuffle(pool.filter((q) => q.diff === d), rnd);
      if (c.length) { out.push(c[0]); used.add(c[0].id); return; }
    }
  });
  return out;
}

function shuffledOrder(rid: string, qid: string): number[] {
  return shuffle([0, 1, 2, 3], rngFrom(`${rid}:${qid}`));
}

function toPublic(rid: string, q: Question): PublicQuestion {
  const order = shuffledOrder(rid, q.id);
  return { id: q.id, cat: q.cat, q: q.q, diff: q.diff, options: order.map((i) => q.options[i]) };
}

export function startRound(req: StartRequest, now = Date.now()): StartResponse | { error: string; status: number } {
  const mode = req.mode;
  if (mode !== "daily" && mode !== "category") return { error: "mode must be daily or category", status: 400 };
  const rid = Math.random().toString(36).slice(2, 10) + now.toString(36);
  const seen = Array.isArray(req.seen) ? req.seen.filter((s) => typeof s === "string" && BY_ID.has(s)).slice(-1000) : [];

  let questions: Question[];
  let repeats = 0;
  let cat: string | null = null;
  let day: string | null = null;

  if (mode === "daily") {
    day = lusakaDay(new Date(now));
    questions = pickDaily(day);
    repeats = questions.filter((q) => seen.includes(q.id)).length;
  } else {
    const c = CATEGORIES.find((x) => x.id === req.category);
    if (!c) return { error: "Unknown category", status: 400 };
    cat = c.id;
    const r = pickForRamp(BANK.filter((q) => q.cat === c.id), seen, rngFrom(rid));
    questions = r.picked;
    repeats = r.repeats;
  }
  if (questions.length < ROUND_SIZE) return { error: "Not enough questions in this category yet", status: 409 };

  const recent = Math.max(0, Math.min(20, Math.floor(Number(req.recentPlays) || 0)));
  const fresh = mode === "daily" ? 100 : Math.round(freshnessMultiplier(recent) * 100);

  const state: RoundState = {
    v: 1, rid, mode, cat, day, qids: questions.map((q) => q.id), i: 0, phase: "shown", t: now, ok: [], pts: [], fresh,
  };
  return {
    token: sign(state), mode, category: cat, day, limitSec: LIMIT_SEC, repeats,
    questions: questions.map((q) => toPublic(rid, q)),
  };
}

type Err = { error: string; status: number };

export function answerQuestion(tokenIn: unknown, choice: unknown, now = Date.now()): AnswerResponse | Err {
  const s = verify<RoundState>(tokenIn);
  if (!s || s.v !== 1) return { error: "Invalid round token", status: 400 };
  if (s.phase !== "shown") return { error: "Question already answered", status: 409 };
  const q = BY_ID.get(s.qids[s.i]);
  if (!q) return { error: "Unknown question", status: 400 };

  const order = shuffledOrder(s.rid, q.id);
  const correctIndex = order.indexOf(q.answer);
  const picked = typeof choice === "number" && Number.isInteger(choice) && choice >= 0 && choice <= 3 ? choice : -1;

  const elapsed = Math.max(0, now - s.t - GRACE_MS);
  const timedOut = picked === -1 || elapsed > LIMIT_SEC * 1000 + 1500;
  const correct = !timedOut && picked === correctIndex;
  const points = answerPoints(q.diff, correct, elapsed);

  const next: RoundState = { ...s, phase: "answered", ok: [...s.ok, correct ? 1 : 0], pts: [...s.pts, points] };
  return { token: sign(next), correct, timedOut, correctIndex, fact: q.fact, points, elapsedMs: Math.round(elapsed) };
}

export function nextQuestion(tokenIn: unknown, now = Date.now()): NextResponse | Err {
  const s = verify<RoundState>(tokenIn);
  if (!s || s.v !== 1) return { error: "Invalid round token", status: 400 };
  if (s.phase !== "answered") return { error: "Answer the current question first", status: 409 };
  if (s.i + 1 >= s.qids.length) return { error: "Round has no more questions", status: 409 };
  return { token: sign({ ...s, i: s.i + 1, phase: "shown", t: now } satisfies RoundState) };
}

export function finishRound(tokenIn: unknown): FinishResponse | Err {
  const s = verify<RoundState>(tokenIn);
  if (!s || s.v !== 1) return { error: "Invalid round token", status: 400 };
  if (s.ok.length !== s.qids.length) return { error: "Round is not finished", status: 409 };
  const correct = s.ok.reduce<number>((a, b) => a + b, 0);
  const base = s.pts.reduce((a, b) => a + b, 0);
  const perfect = correct === s.qids.length ? PERFECT_BONUS : 0;
  const fresh = s.fresh / 100;
  return {
    correct, total: s.qids.length, basePoints: base, perfectBonus: perfect, freshness: fresh,
    points: Math.round((base + perfect) * fresh),
    grid: s.ok.map((x) => (x ? "hit" : "miss")),
    day: s.day, category: s.cat, mode: s.mode, questionIds: s.qids,
  };
}
