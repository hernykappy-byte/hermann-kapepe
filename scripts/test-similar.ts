import { similarity } from "../lib/similar.ts";
let fail = 0;
const ok = (n: string, p: boolean) => { console.log(`${p ? "ok  " : "FAIL"} ${n}`); if (!p) fail++; };
const mk = (q: string, opts: string[], answer: number, fact = "") => ({ q, options: opts, answer, fact });
const a = mk("Which river flows through Cairo?", ["Nile", "Congo", "Niger", "Zambezi"], 0, "The Nile runs through the Egyptian capital.");
ok("template questions with different answers are NOT duplicates", !similarity(a, mk("Which river flows through Baghdad?", ["Tigris", "Nile", "Danube", "Ganges"], 0)).reason);
ok("largest vs smallest are NOT duplicates", !similarity(mk("Which is the largest country in the world by area?", ["Russia", "Canada", "China", "USA"], 0), mk("Which is the smallest country in the world by area?", ["Vatican City", "Monaco", "Nauru", "Malta"], 0)).reason);
ok("a reworded repeat with the same answer IS a duplicate", !!similarity(a, mk("Through which African capital does the Nile river flow?", ["Nile", "Congo", "Niger", "Zambezi"], 0)).reason);
ok("same fact, same answer, different wording IS a duplicate", !!similarity(mk("Which city is the capital of Zambia?", ["Ndola", "Lusaka", "Kitwe", "Kabwe"], 1, "Lusaka is the capital."), mk("What is the capital city of Zambia called?", ["Kabwe", "Livingstone", "Lusaka", "Mansa"], 2, "Lusaka is Zambia's capital city.")).reason);
// Known limit: an inverted question (answer and subject swapped) is not caught; a human review step still matters.
ok("inverted question is a known limit, not flagged", !similarity(mk("Which city is the capital of Zambia?", ["Ndola", "Lusaka", "Kitwe", "Kabwe"], 1), mk("Lusaka is the capital city of which country?", ["Zambia", "Malawi", "Kenya", "Ghana"], 0)).reason);
ok("identical text IS a duplicate", !!similarity(a, a).reason);
ok("unrelated questions are NOT duplicates", !similarity(a, mk("What gas do plants absorb from the air?", ["Carbon dioxide", "Oxygen", "Helium", "Neon"], 0)).reason);
process.exit(fail ? 1 : 0);
