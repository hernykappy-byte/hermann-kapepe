import { timingSafeEqual } from "node:crypto";
import { BANK, CATEGORIES } from "@/lib/bank";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Drafts new questions with Gemini, has any configured checker (Groq, Cerebras, Claude) review
// them, and returns DRAFTS ONLY. Nothing is added to the live bank: a human reviews and pastes in what passes.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash"; // model name carried over from the AI Studio app
const CLAUDE_MODEL = process.env.CLAUDE_VERIFY_MODEL || "claude-sonnet-5-5";

type Draft = { q: string; options: string[]; answer: number; diff: "E" | "M" | "H"; fact: string };
type Verdict = { ok: boolean; note: string };

const words = (s: string) => new Set(s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 2));
function jaccard(a: Set<string>, b: Set<string>) {
  let i = 0;
  for (const w of a) if (b.has(w)) i++;
  return i / (a.size + b.size - i || 1);
}

function authed(req: Request) {
  const want = process.env.ADMIN_TOKEN;
  const got = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!want || want.length < 16) return false; // no token configured = endpoint is off
  const a = Buffer.from(got), b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function gemini(cat: string, catBlurb: string, n: number, avoid: string[]): Promise<Draft[]> {
  const prompt =
    `Write ${n} multiple-choice quiz questions for the category "${cat}" (${catBlurb}). ` +
    `Audience: general players in Zambia and southern Africa. Four options each, exactly one correct. ` +
    `Mix difficulty E, M and H. Each "fact" is one sentence explaining the answer. ` +
    `Only include facts you are certain of; skip anything you are unsure about. ` +
    `Do not repeat or closely rephrase these existing questions:\n- ${avoid.slice(0, 40).join("\n- ")}`;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY! },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                q: { type: "STRING" },
                options: { type: "ARRAY", items: { type: "STRING" } },
                answer: { type: "INTEGER" },
                diff: { type: "STRING", enum: ["E", "M", "H"] },
                fact: { type: "STRING" },
              },
              required: ["q", "options", "answer", "diff", "fact"],
            },
          },
        },
      }),
    },
  );
  if (!res.ok) throw new Error(`Gemini returned ${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
  return JSON.parse(text) as Draft[];
}

type Checker = { name: string; run: (list: string) => Promise<string> };

const PROMPT = (list: string) =>
  `You are a strict fact-checker for a quiz. For each question decide whether the marked answer is definitely correct, ` +
  `no other option is also correct, and the wording is unambiguous. If unsure, say not ok. ` +
  `Reply with ONLY a JSON array like [{"i":0,"ok":true,"note":"short reason"}] covering every number.\n\n${list}`;

// Free checkers speak the OpenAI chat format. Model names change often, so each is overridable.
function openAiCompatible(name: string, base: string, key: string, model: string): Checker {
  return {
    name,
    run: async (list) => {
      const res = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
        body: JSON.stringify({ model, temperature: 0, messages: [{ role: "user", content: PROMPT(list) }] }),
      });
      if (!res.ok) throw new Error(`${name} returned ${res.status}`);
      return (await res.json())?.choices?.[0]?.message?.content ?? "[]";
    },
  };
}

function checkers(): Checker[] {
  const out: Checker[] = [];
  const g = process.env.GROQ_API_KEY, c = process.env.CEREBRAS_API_KEY, a = process.env.ANTHROPIC_API_KEY;
  if (g) out.push(openAiCompatible("groq", "https://api.groq.com/openai/v1", g, process.env.GROQ_MODEL || "llama-3.3-70b-versatile"));
  if (c) out.push(openAiCompatible("cerebras", "https://api.cerebras.ai/v1", c, process.env.CEREBRAS_MODEL || "llama-3.3-70b"));
  if (a) out.push({
    name: "claude",
    run: async (list) => {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": a, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 2000, messages: [{ role: "user", content: PROMPT(list) }] }),
      });
      if (!res.ok) throw new Error(`claude returned ${res.status}`);
      return (await res.json())?.content?.[0]?.text ?? "[]";
    },
  });
  return out;
}

type Review = { ok: boolean; note: string; by: Record<string, Verdict | null> };

/** Every configured checker reviews every draft. A draft is ok only if all that answered agree. */
async function review(drafts: Draft[]): Promise<{ reviews: Review[]; used: string[] } | null> {
  const cs = checkers();
  if (!cs.length || !drafts.length) return null;
  const list = drafts.map((d, i) => `${i}. ${d.q}\n   ${d.options.map((o, k) => `${"ABCD"[k]}) ${o}`).join("  ")}\n   Marked correct: ${"ABCD"[d.answer]}`).join("\n");
  const results = await Promise.all(cs.map(async (c) => {
    try {
      const raw = await c.run(list);
      const arr = JSON.parse(raw.slice(raw.indexOf("["), raw.lastIndexOf("]") + 1)) as { i: number; ok: boolean; note: string }[];
      return { name: c.name, arr };
    } catch {
      return { name: c.name, arr: null };
    }
  }));
  const answered = results.filter((r) => r.arr);
  if (!answered.length) return null;
  const reviews = drafts.map((_, i): Review => {
    const by: Record<string, Verdict | null> = {};
    for (const r of results) {
      const v = r.arr?.find((x) => x.i === i);
      by[r.name] = v ? { ok: !!v.ok, note: String(v.note || "") } : null;
    }
    const given = answered.map((r) => by[r.name]);
    const ok = given.every((v) => v?.ok === true);
    const note = given.filter((v) => v && !v.ok).map((v) => v!.note).join(" | ") || (ok ? "All checkers agree." : "No verdict returned");
    return { ok, note, by };
  });
  return { reviews, used: answered.map((r) => r.name) };
}

export async function POST(req: Request) {
  if (!authed(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.GEMINI_API_KEY) return Response.json({ error: "GEMINI_API_KEY is not set" }, { status: 503 });

  const body = (await req.json().catch(() => ({}))) as { category?: string; count?: number };
  const cat = CATEGORIES.find((c) => c.id === body.category);
  if (!cat) return Response.json({ error: "Unknown category" }, { status: 400 });
  const n = Math.max(1, Math.min(15, Math.floor(Number(body.count) || 8)));

  const existing = BANK.filter((q) => q.cat === cat.id);
  try {
    const raw = await gemini(cat.name, cat.blurb, n, existing.map((q) => q.q));
    const existingW = BANK.map((q) => words(q.q));
    const kept: Draft[] = [];
    let dupes = 0, malformed = 0;
    for (const d of raw) {
      const valid =
        d && typeof d.q === "string" && Array.isArray(d.options) && d.options.length === 4 &&
        new Set(d.options.map((o) => o.trim().toLowerCase())).size === 4 &&
        Number.isInteger(d.answer) && d.answer >= 0 && d.answer <= 3 && ["E", "M", "H"].includes(d.diff) && !!d.fact;
      if (!valid) { malformed++; continue; }
      const w = words(d.q);
      if (existingW.some((e) => jaccard(w, e) > 0.6) || kept.some((k) => jaccard(w, words(k.q)) > 0.6)) { dupes++; continue; }
      kept.push(d);
    }
    const checked = await review(kept);
    return Response.json({
      category: cat.id,
      note: "Drafts only. Not added to the bank. A person must review before anything goes live. A checker saying ok is a signal, not proof.",
      checked_by: checked?.used ?? [],
      dropped: { duplicates: dupes, malformed },
      drafts: kept.map((d, i) => ({ ...d, review: checked ? checked.reviews[i] : null })),
    });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 502 });
  }
}
