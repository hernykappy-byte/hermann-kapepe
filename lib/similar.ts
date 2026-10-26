// Duplicate detection for quiz questions. Catches reworded repeats, and different questions
// that test the same fact (same correct answer plus overlapping wording).
const STOP = new Set("the a an of in on at to is are was were which what who whom whose how many much does did do for from by with and or as it its this that these those name known called first most one into than then there their his her he she they be been being has have had not no yes".split(" "));

const stem = (w: string) => w.replace(/(ing|ed|es|s)$/, "");

export function keywords(s: string): Set<string> {
  return new Set(
    s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w)).map(stem),
  );
}

function overlap(a: Set<string>, b: Set<string>): number {
  let i = 0;
  for (const w of a) if (b.has(w)) i++;
  return i / (a.size + b.size - i || 1);
}

export type Q = { q: string; options: readonly string[]; answer: number; fact?: string };

export type Similarity = { score: number; reason: "near-identical" | "same-answer" | "same-options" | null };

const norm = (s: string) => s.trim().toLowerCase();

/**
 * Higher score means more alike. `reason` is set when the pair should be treated as a duplicate.
 * Template questions ("Which river flows through Cairo?" / "...Baghdad?") share wording but are
 * different questions, so wording alone only counts when it is almost identical. Otherwise two
 * questions are duplicates when they also share the correct answer or most of their options.
 */
export function similarity(a: Q, b: Q): Similarity {
  const qa = keywords(a.q), qb = keywords(b.q);
  const q = overlap(qa, qb);
  if (q >= 0.8) return { score: q, reason: "near-identical" };
  if (norm(a.options[a.answer]) === norm(b.options[b.answer])) {
    const combined = overlap(new Set([...qa, ...keywords(a.fact ?? "")]), new Set([...qb, ...keywords(b.fact ?? "")]));
    if (q >= 0.34 || combined >= 0.4) return { score: Math.max(q, combined), reason: "same-answer" };
  }
  const shared = a.options.filter((o) => b.options.some((x) => norm(x) === norm(o))).length;
  if (shared >= 3 && q >= 0.5) return { score: q, reason: "same-options" };
  return { score: q, reason: null };
}

export function findDuplicate<T extends Q>(candidate: Q, pool: readonly T[]): { match: T; sim: Similarity } | null {
  for (const p of pool) {
    const sim = similarity(candidate, p);
    if (sim.reason) return { match: p, sim };
  }
  return null;
}
