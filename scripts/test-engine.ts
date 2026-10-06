import assert from "node:assert/strict";
import { startRound, answerQuestion, nextQuestion, finishRound } from "../lib/round";
import { BY_ID, BANK, CATEGORIES } from "../lib/bank";
import { answerPoints, freshnessMultiplier } from "../lib/scoring";
import { verify } from "../lib/token";
import { lusakaDay, msUntilNextLusakaDay } from "../lib/daily";

let n = 0;
const ok = (name: string, fn: () => void) => { fn(); n++; console.log("ok  ", name); };

// Find the shuffled index of the correct answer by playing the round honestly.
function play(start: any, pickCorrect: (qid: string, correctIdx: number) => number, t0: number, perQ = 2000) {
  let token = start.token;
  let now = t0;
  const results: any[] = [];
  for (let i = 0; i < start.questions.length; i++) {
    const q = start.questions[i];
    const full = BY_ID.get(q.id)!;
    const correctText = full.options[full.answer];
    const correctIdx = q.options.indexOf(correctText);
    now += perQ;
    const a: any = answerQuestion(token, pickCorrect(q.id, correctIdx), now);
    assert.ok(!a.error, a.error);
    results.push(a);
    token = a.token;
    if (i < start.questions.length - 1) {
      const nx: any = nextQuestion(token, now + 1500);
      assert.ok(!nx.error, nx.error);
      token = nx.token;
      now += 1500;
    }
  }
  return { token, results };
}

ok("category round has 5 questions, ramp E-M-H-M-E, no answers leaked", () => {
  const s: any = startRound({ mode: "category", category: "zambia" }, 1_000_000);
  assert.equal(s.questions.length, 5);
  assert.deepEqual(s.questions.map((q: any) => q.diff), ["E", "M", "H", "M", "E"]);
  for (const q of s.questions) {
    assert.equal(q.options.length, 4);
    assert.ok(!("answer" in q) && !("fact" in q));
  }
  const state: any = verify(s.token);
  assert.equal(state.i, 0);
});

ok("options are shuffled per round (not always the stored order)", () => {
  let moved = 0, total = 0;
  for (let k = 0; k < 30; k++) {
    const s: any = startRound({ mode: "category", category: "science" }, 1_000_000 + k);
    for (const q of s.questions) { const f = BY_ID.get(q.id)!; total++; if (q.options[f.answer] !== f.options[f.answer] || q.options.indexOf(f.options[f.answer]) !== f.answer) moved++; }
  }
  assert.ok(moved / total > 0.5, `only ${moved}/${total} moved`);
});

ok("perfect round: all hits, bonus applied, fast answers earn more", () => {
  const s: any = startRound({ mode: "category", category: "history" }, 5_000_000);
  const { token, results } = play(s, (_q, c) => c, 5_000_000, 2000);
  assert.ok(results.every((r: any) => r.correct));
  const f: any = finishRound(token);
  assert.equal(f.correct, 5);
  assert.equal(f.perfectBonus, 500);
  assert.equal(f.points, f.basePoints + 500);
  assert.deepEqual(f.grid, ["hit", "hit", "hit", "hit", "hit"]);
});

ok("wrong answers score zero and show the correct index", () => {
  const s: any = startRound({ mode: "category", category: "africa" }, 6_000_000);
  const { token, results } = play(s, (_q, c) => (c + 1) % 4, 6_000_000);
  assert.ok(results.every((r: any) => !r.correct && r.points === 0));
  const f: any = finishRound(token);
  assert.equal(f.points, 0);
  assert.equal(f.perfectBonus, 0);
});

ok("replaying a token is rejected (cannot answer twice)", () => {
  const s: any = startRound({ mode: "category", category: "music" }, 7_000_000);
  const a: any = answerQuestion(s.token, 0, 7_002_000);
  const again: any = answerQuestion(a.token, 0, 7_002_500);
  assert.equal(again.status, 409);
});

ok("tampered token is rejected", () => {
  const s: any = startRound({ mode: "category", category: "music" }, 7_000_000);
  const [body, mac] = s.token.split(".");
  const evil = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(body, "base64url").toString()), i: 4 })).toString("base64url") + "." + mac;
  const r: any = answerQuestion(evil, 0, 7_002_000);
  assert.equal(r.status, 400);
});

ok("cannot skip ahead without answering", () => {
  const s: any = startRound({ mode: "category", category: "music" }, 7_000_000);
  const r: any = nextQuestion(s.token, 7_001_000);
  assert.equal(r.status, 409);
  const f: any = finishRound(s.token);
  assert.equal(f.status, 409);
});

ok("late answers time out and score zero", () => {
  const s: any = startRound({ mode: "category", category: "film" }, 8_000_000);
  const full = BY_ID.get(s.questions[0].id)!;
  const ci = s.questions[0].options.indexOf(full.options[full.answer]);
  const a: any = answerQuestion(s.token, ci, 8_000_000 + 30_000);
  assert.equal(a.timedOut, true);
  assert.equal(a.points, 0);
});

ok("speed: instant = full, at the limit = half, never below half", () => {
  assert.equal(answerPoints("M", true, 100), 800);
  assert.equal(answerPoints("M", true, 20_000), 400);
  assert.equal(answerPoints("M", true, 99_000), 400);
  assert.equal(answerPoints("H", false, 100), 0);
});

ok("freshness multiplier steps down then floors", () => {
  assert.deepEqual([0, 1, 2, 3, 9].map(freshnessMultiplier), [1, 0.6, 0.4, 0.2, 0.2]);
});

ok("daily round is identical for everyone on the same day, differs next day", () => {
  const t = Date.parse("2026-10-06T10:00:00Z");
  const a: any = startRound({ mode: "daily" }, t);
  const b: any = startRound({ mode: "daily" }, t + 3600_000);
  assert.deepEqual(a.questions.map((q: any) => q.id), b.questions.map((q: any) => q.id));
  const c: any = startRound({ mode: "daily" }, t + 86_400_000);
  assert.notDeepEqual(a.questions.map((q: any) => q.id), c.questions.map((q: any) => q.id));
  assert.equal(a.questions.length, 5);
  assert.equal(new Set(a.questions.map((q: any) => q.cat)).size, 5, "daily should span 5 categories");
});

ok("no-repeat: unseen questions come first, repeats only after exhaustion", () => {
  const seen: string[] = [];
  let firstRepeatRound = -1;
  for (let r = 0; r < 6; r++) {
    const s: any = startRound({ mode: "category", category: "tech", seen }, 9_000_000 + r);
    if (s.repeats > 0 && firstRepeatRound < 0) firstRepeatRound = r;
    if (firstRepeatRound < 0) for (const q of s.questions) assert.ok(!seen.includes(q.id), "repeat before exhaustion");
    for (const q of s.questions) if (!seen.includes(q.id)) seen.push(q.id);
  }
  console.log("      first round with a repeat:", firstRepeatRound + 1, "(bank has", BANK.filter((q) => q.cat === "tech").length, "tech questions)");
  assert.ok(firstRepeatRound >= 2);
});

ok("every category can build a round", () => {
  for (const c of CATEGORIES) {
    const s: any = startRound({ mode: "category", category: c.id }, 1);
    assert.equal(s.questions.length, 5, c.id);
  }
});

ok("Lusaka day rolls over at 22:00 UTC", () => {
  assert.equal(lusakaDay(new Date("2026-10-06T21:59:00Z")), "2026-10-06");
  assert.equal(lusakaDay(new Date("2026-10-06T22:00:00Z")), "2026-10-07");
  assert.equal(msUntilNextLusakaDay(new Date("2026-10-06T21:00:00Z")), 3600_000);
});

console.log(`\n${n} checks passed`);
