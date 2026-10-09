// Two steps to grow the bank safely.
//   draft:  ADMIN_TOKEN=... SITE_URL=https://grrand-quiz.vercel.app npx tsx scripts/questions.mts draft zambia 8
//           Calls the live generator, saves drafts/<category>-<time>.json. Nothing touches the bank.
//   add:    npx tsx scripts/questions.mts add drafts/zambia-....json --accept 0,2,3     (after a person reads them)
//           npx tsx scripts/questions.mts add <file> --all-ok                           (every draft all checkers passed)
//           Appends to the END of that category in lib/bank.ts (ids are stored in players' histories,
//           so entries are never reordered), then run: npm run check:bank
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

type Draft = { q: string; options: string[]; answer: number; diff: "E" | "M" | "H"; fact: string; review?: { ok: boolean; note: string } | null };
type File = { category: string; drafts: Draft[] };

export function appendToBank(src: string, cat: string, rows: Draft[]): string {
  const start = src.indexOf(`\n  ${cat}: [\n`);
  if (start < 0) throw new Error(`Category "${cat}" not found in bank`);
  const close = src.indexOf("\n  ],", start);
  if (close < 0) throw new Error(`Could not find the end of "${cat}"`);
  const lines = rows.map((d) => "    " + JSON.stringify([d.q.trim(), ...d.options.map((o) => o.trim()), d.answer, d.diff, d.fact.trim()]) + ",");
  return src.slice(0, close) + "\n" + lines.join("\n") + src.slice(close);
}

async function main() {
  const [cmd, a, b] = process.argv.slice(2);
  if (cmd === "draft") {
    const token = process.env.ADMIN_TOKEN, site = process.env.SITE_URL || "https://grrand-quiz.vercel.app";
    if (!token || !a) throw new Error("Usage: ADMIN_TOKEN=... draft <category> [count]");
    const r = await fetch(`${site}/api/admin/generate`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, body: JSON.stringify({ category: a, count: Number(b) || 8 }) });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
    mkdirSync("drafts", { recursive: true });
    const file = `drafts/${a}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    writeFileSync(file, JSON.stringify(data, null, 2));
    console.log(`Saved ${file}  (checked by: ${data.checked_by?.join(", ") || "nobody"}; dropped ${data.dropped.duplicates} duplicates, ${data.dropped.malformed} malformed)\n`);
    data.drafts.forEach((d: Draft, i: number) => console.log(`${i}. [${d.diff}] ${d.q}\n   ${d.options.map((o, k) => `${"ABCD"[k]}${k === d.answer ? "*" : ")"} ${o}`).join("  ")}\n   ${d.review ? (d.review.ok ? "checkers: ok" : "checkers: DOUBT - " + d.review.note) : "unchecked"}\n   ${d.fact}\n`));
    return;
  }
  if (cmd === "add") {
    if (!a) throw new Error("Usage: add <file> --accept 0,1 | --all-ok");
    const f = JSON.parse(readFileSync(a, "utf8")) as File;
    const flag = process.argv[4], list = process.argv[5];
    const pick = flag === "--accept" ? (list || "").split(",").map((x) => Number(x.trim())) : flag === "--all-ok" ? f.drafts.map((d, i) => (d.review?.ok ? i : -1)) : null;
    if (!pick) throw new Error("Say which to add: --accept 0,2 or --all-ok");
    const rows = [...new Set(pick)].filter((i) => f.drafts[i]).map((i) => f.drafts[i]);
    if (!rows.length) throw new Error("No drafts selected");
    const path = new URL("../lib/bank.ts", import.meta.url);
    writeFileSync(path, appendToBank(readFileSync(path, "utf8"), f.category, rows));
    console.log(`Added ${rows.length} to ${f.category}. Now run: npm run check:bank`);
    return;
  }
  console.log("Commands: draft <category> [count] | add <file> --accept 0,1 | --all-ok");
}

if (/[\\/]questions\.mts$/.test(process.argv[1] || "")) main().catch((e) => { console.error(e.message); process.exit(1); });
