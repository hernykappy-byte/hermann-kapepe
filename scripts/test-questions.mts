import { appendToBank } from "./questions.mts";
import { readFileSync } from "node:fs";
let fail = 0;
const ok = (n: string, p: boolean) => { console.log(`${p ? "ok  " : "FAIL"} ${n}`); if (!p) fail++; };
const src = readFileSync(new URL("../lib/bank.ts", import.meta.url), "utf8");
const d = { q: "Which lake is Zambia's largest by area?", options: ["Kariba", "Bangweulu", "Mweru", "Tanganyika"], answer: 1, diff: "M" as const, fact: "Lake Bangweulu and its swamps cover a huge area." };
const out = appendToBank(src, "zambia", [d]);
ok("adds after the last zambia entry, before the closing bracket", out.indexOf(d.q) > out.indexOf("Which city is the capital of Zambia?") && out.indexOf(d.q) < out.indexOf("\n  africa: ["));
ok("does not touch other categories", out.split("\n").length === src.split("\n").length + 1);
ok("existing entries keep their positions", out.indexOf("Which city is the capital of Zambia?") === src.indexOf("Which city is the capital of Zambia?"));
ok("quotes in text are escaped", appendToBank(src, "zambia", [{ ...d, q: 'He said "hi"?' }]).includes('He said \\"hi\\"?'));
try { appendToBank(src, "nope", [d]); ok("unknown category rejected", false); } catch { ok("unknown category rejected", true); }
process.exit(fail ? 1 : 0);
