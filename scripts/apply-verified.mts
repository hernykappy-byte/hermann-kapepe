// Combine merged drafts with source-verification results into final per-category files.
//   npx tsx scripts/apply-verified.mts <draftsDir> <mergedDir> <outDir> [--keep-unsourced]
// Items that were in a risk batch need a src verdict of ok or fix; a drop, or a missing verdict,
// leaves them out. Items not in any risk batch (no dates, numbers or superlatives) pass on the
// first review alone.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { BANK } from "../lib/bank.ts";
import { findDuplicate } from "../lib/similar.ts";

type D = { category: string; q: string; options: string[]; answer: number; diff: "E" | "M" | "H"; fact: string };
type S = { i: number; verdict: "ok" | "fix" | "drop"; fixed?: D; source?: string };

const [dir, merged, out] = process.argv.slice(2);
const keepUnsourced = process.argv.includes("--keep-unsourced");
const audit: { q: string; level: "sourced" | "unsourced" | "reviewed" }[] = [];
mkdirSync(out, { recursive: true });
const status = new Map<string, { d: D | null; why: string }>(); // keyed by original question text
for (const n of [1, 2, 3, 4]) {
  const riskF = `${dir}/risk${n}.json`, srcF = `${dir}/src${n}.json`;
  if (!existsSync(riskF)) continue;
  const risk = JSON.parse(readFileSync(riskF, "utf8")) as D[];
  const src = existsSync(srcF) ? (JSON.parse(readFileSync(srcF, "utf8")) as S[]) : [];
  risk.forEach((r, i) => {
    const v = src.find((x) => x.i === i);
    if (!v || v.verdict === "drop") status.set(r.q, keepUnsourced ? { d: r, why: "unsourced" } : { d: null, why: "dropped" });
    else if (v.verdict === "fix" && v.fixed) status.set(r.q, { d: { ...v.fixed, category: r.category }, why: "fixed" });
    else status.set(r.q, { d: r, why: "sourced" });
  });
}
const pool = [...BANK] as { q: string; options: readonly string[]; answer: number; fact?: string }[];
const tally = { sourced: 0, fixed: 0, unsourced: 0, reviewedOnly: 0, dropped: 0, dupe: 0 };
for (const f of readdirSync(merged).filter((x) => x.endsWith(".json") && !x.startsWith("_"))) {
  const { category, drafts } = JSON.parse(readFileSync(`${merged}/${f}`, "utf8")) as { category: string; drafts: D[] };
  const keep: D[] = [];
  for (const d of drafts) {
    const s = status.get(d.q);
    let final: D | null = d;
    if (s) { final = s.d; tally[s.why as keyof typeof tally]++; }
    else tally.reviewedOnly++;
    if (!final) continue;
    if (findDuplicate(final, pool)) { tally.dupe++; continue; }
    pool.push(final); keep.push(final);
    audit.push({ q: final.q, level: !s ? "reviewed" : s.why === "unsourced" ? "unsourced" : "sourced" });
  }
  writeFileSync(`${out}/${category}.json`, JSON.stringify({ category, drafts: keep.map((r) => ({ ...r, review: { ok: true, note: "verified" } })) }, null, 2));
  console.log(category.padEnd(10), keep.length);
}
writeFileSync(`${out}/_audit.json`, JSON.stringify(audit, null, 1));
console.log(tally);
