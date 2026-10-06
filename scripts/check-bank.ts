import { BANK, CATEGORIES } from "../lib/bank.ts";

let problems = 0;
const fail = (m: string) => { problems++; console.log("FAIL", m); };

const seen = new Map<string, string>();
for (const q of BANK) {
  if (q.options.length !== 4) fail(`${q.id}: needs 4 options`);
  if (new Set(q.options.map((o) => o.trim().toLowerCase())).size !== 4) fail(`${q.id}: duplicate options`);
  if (!(q.answer >= 0 && q.answer <= 3)) fail(`${q.id}: answer out of range`);
  if (!q.q.trim().endsWith("?") && !q.q.trim().endsWith("...")) fail(`${q.id}: question should end with ? or ...`);
  if (q.fact.length < 15) fail(`${q.id}: fact too short`);
  const key = q.q.trim().toLowerCase();
  if (seen.has(key)) fail(`${q.id}: duplicate question text of ${seen.get(key)}`);
  seen.set(key, q.id);
}

const letters = [0, 0, 0, 0];
for (const q of BANK) letters[q.answer]++;
console.log("Correct-answer position (A/B/C/D):", letters.join(" / "));

console.log("\ncategory            total   E   M   H");
for (const c of CATEGORIES) {
  const qs = BANK.filter((q) => q.cat === c.id);
  const n = (d: string) => qs.filter((q) => q.diff === d).length;
  console.log(c.id.padEnd(18), String(qs.length).padStart(5), String(n("E")).padStart(4), String(n("M")).padStart(3), String(n("H")).padStart(3));
  if (n("E") < 2 || n("M") < 2 || n("H") < 1) fail(`${c.id}: not enough of each difficulty for a round`);
}
console.log("\nTotal questions:", BANK.length);
console.log(problems ? `\n${problems} problem(s)` : "\nBank structure OK");
process.exit(problems ? 1 : 0);
