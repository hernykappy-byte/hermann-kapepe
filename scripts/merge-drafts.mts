// Merge writer drafts with checker verdicts into per-category files that `questions.mts add` accepts.
//   npx tsx scripts/merge-drafts.mts <draftsDir> <outDir> [--allow-unsourced]
// Keeps verdict ok and fix (using the corrected object), drops "drop", then removes malformed
// items and anything duplicating the bank or an earlier kept draft.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { BANK } from "../lib/bank.ts";
import { findDuplicate } from "../lib/similar.ts";

type D = { category: string; q: string; options: string[]; answer: number; diff: "E" | "M" | "H"; fact: string };
type V = { i: number; verdict: "ok" | "fix" | "drop"; note: string; fixed?: D };

const [dir, out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const valid = (d: D) =>
  d && typeof d.q === "string" && d.q.trim().length > 8 && /[?]$|\.\.\.$/.test(d.q.trim()) && Array.isArray(d.options) && d.options.length === 4 &&
  new Set(d.options.map((o) => String(o).trim().toLowerCase())).size === 4 && Number.isInteger(d.answer) && d.answer >= 0 && d.answer <= 3 &&
  ["E", "M", "H"].includes(d.diff) && typeof d.fact === "string" && d.fact.trim().length >= 15;

const byCat: Record<string, D[]> = {};
const stats = { ok: 0, fix: 0, drop: 0, malformed: 0, dupe: 0 };
const pool = [...BANK] as { q: string; options: readonly string[]; answer: number; fact?: string }[];
for (const n of [1, 2, 3, 4]) {
  if (!existsSync(`${dir}/writer${n}.json`) || !existsSync(`${dir}/check${n}.json`)) { console.log(`skip set ${n} (missing files)`); continue; }
  const drafts = JSON.parse(readFileSync(`${dir}/writer${n}.json`, "utf8")) as D[];
  const verdicts = JSON.parse(readFileSync(`${dir}/check${n}.json`, "utf8")) as V[];
  drafts.forEach((orig, i) => {
    const v = verdicts.find((x) => x.i === i);
    if (!v || v.verdict === "drop") { stats.drop++; return; }
    const d = v.verdict === "fix" && v.fixed ? { ...v.fixed, category: orig.category } : orig;
    stats[v.verdict === "fix" ? "fix" : "ok"]++;
    if (!valid(d)) { stats.malformed++; console.log("malformed:", d?.q); return; }
    if (findDuplicate(d, pool)) { stats.dupe++; console.log("duplicate dropped:", d.q); return; }
    pool.push(d);
    (byCat[d.category] ||= []).push(d);
  });
}
for (const [cat, rows] of Object.entries(byCat)) {
  writeFileSync(`${out}/${cat}.json`, JSON.stringify({ category: cat, drafts: rows.map((r) => ({ ...r, review: { ok: true, note: "checked" } })) }, null, 2));
  console.log(cat.padEnd(10), rows.length);
}
console.log(stats);
