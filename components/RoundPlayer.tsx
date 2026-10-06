"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Arrow, Check, Cross, Dash } from "./Icons";
import { load, recentPlays, recordRound, setActive } from "@/lib/local";
import { lusakaDay } from "@/lib/daily";
import { SITE } from "@/lib/config";
import type { AnswerResponse, FinishResponse, NextResponse, StartResponse } from "@/lib/types";

type Props = { mode: "daily" | "category"; category: string | null; cats: { id: string; name: string }[] };
type Answered = AnswerResponse & { picked: number };
type Summary = {
  mode: "daily" | "category";
  day: string | null;
  category: string | null;
  points: number;
  correct: number;
  total: number;
  grid: ("hit" | "miss")[];
  detail?: { base: number; perfect: number; fresh: number };
  replay?: boolean;
};

const LETTERS = ["A", "B", "C", "D"];

async function post<T>(url: string, body: unknown): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw Object.assign(new Error(data?.error || "Something went wrong"), { fatal: true });
      return data as T;
    } catch (e) {
      lastErr = e;
      if ((e as { fatal?: boolean }).fatal) throw e; // server said no: retrying will not help
      await new Promise((r) => setTimeout(r, 600));
    }
  }
  throw lastErr;
}

export default function RoundPlayer({ mode, category, cats }: Props) {
  const router = useRouter();
  const catName = cats.find((c) => c.id === category)?.name ?? null;

  const [phase, setPhase] = useState<"loading" | "error" | "question" | "feedback" | "summary">("loading");
  const [error, setError] = useState<string | null>(null);
  const [start, setStart] = useState<StartResponse | null>(null);
  const [token, setToken] = useState("");
  const [i, setI] = useState(0);
  const [shownAt, setShownAt] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answered[]>([]);
  const [left, setLeft] = useState(20000);
  const [retry, setRetry] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [copied, setCopied] = useState(false);

  const busy = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const qHead = useRef<HTMLHeadingElement>(null);
  const nextBtn = useRef<HTMLButtonElement>(null);

  const persist = useCallback((s: StartResponse, tok: string, idx: number, ph: "shown" | "answered", at: number, ans: Answered[]) => {
    setActive({ start: s, token: tok, i: idx, phase: ph, shownAt: at, answers: ans, savedAt: Date.now() });
  }, []);

  // ---- begin: resume, show today's finished daily, or start fresh ----
  const begin = useCallback(async () => {
    setPhase("loading");
    setError(null);
    const local = load();
    const a = local.active;
    if (a && a.start.mode === mode && (a.start.category ?? null) === category && (mode === "category" || a.start.day === lusakaDay())) {
      setStart(a.start); setToken(a.token); setI(a.i); setShownAt(a.shownAt); setAnswers(a.answers);
      if (a.phase === "answered" && a.answers.length) {
        setSelected(a.answers[a.answers.length - 1].picked);
        setPhase("feedback");
      } else {
        setSelected(null);
        setPhase("question");
      }
      return;
    }
    if (mode === "daily") {
      const d = local.daily[lusakaDay()];
      if (d) {
        setSummary({ mode, day: lusakaDay(), category: null, points: d.points, correct: d.correct, total: d.total, grid: d.grid, replay: true });
        setPhase("summary");
        return;
      }
    }
    try {
      const s = await post<StartResponse>("/api/round/start", {
        mode, category: category ?? undefined, seen: local.seen,
        recentPlays: category ? recentPlays(local, category) : 0,
      });
      setStart(s); setToken(s.token); setI(0); setAnswers([]); setSelected(null);
      const at = Date.now();
      setShownAt(at);
      persist(s, s.token, 0, "shown", at, []);
      setPhase("question");
    } catch (e) {
      setError((e as Error).message || "Could not start the round.");
      setPhase("error");
    }
  }, [mode, category, persist]);

  useEffect(() => { void begin(); }, [begin]);

  // ---- answering ----
  const submit = useCallback(async (choice: number) => {
    if (busy.current || !start) return;
    busy.current = true;
    setSelected(choice);
    setRetry(null);
    try {
      const r = await post<AnswerResponse>("/api/round/answer", { token, choice });
      const row: Answered = { ...r, picked: choice };
      const all = [...answers, row];
      setAnswers(all);
      setToken(r.token);
      persist(start, r.token, i, "answered", shownAt, all);
      try { navigator.vibrate?.(r.correct ? 12 : [30, 40, 30]); } catch { /* not supported */ }
      setPhase("feedback");
    } catch (e) {
      setRetry((e as { fatal?: boolean }).fatal ? (e as Error).message : "No connection. Your answer is kept.");
    } finally {
      busy.current = false;
    }
  }, [start, token, answers, i, shownAt, persist]);

  const goNext = useCallback(async () => {
    if (busy.current || !start) return;
    busy.current = true;
    setRetry(null);
    try {
      if (i + 1 >= start.questions.length) {
        const f = await post<FinishResponse>("/api/round/finish", { token });
        recordRound(f);
        setSummary({
          mode: f.mode, day: f.day, category: f.category, points: f.points, correct: f.correct, total: f.total, grid: f.grid,
          detail: { base: f.basePoints, perfect: f.perfectBonus, fresh: f.freshness },
        });
        setPhase("summary");
      } else {
        const n = await post<NextResponse>("/api/round/next", { token });
        const at = Date.now();
        setToken(n.token); setI(i + 1); setSelected(null); setShownAt(at); setLeft(start.limitSec * 1000);
        persist(start, n.token, i + 1, "shown", at, answers);
        setPhase("question");
      }
    } catch (e) {
      setRetry((e as { fatal?: boolean }).fatal ? (e as Error).message : "No connection. Tap again to retry.");
    } finally {
      busy.current = false;
    }
  }, [start, i, token, answers, persist]);

  // ---- timer ----
  useEffect(() => {
    if (phase !== "question" || selected !== null || !start) return;
    const limit = start.limitSec * 1000;
    const tick = () => {
      const remain = limit - (Date.now() - shownAt);
      setLeft(Math.max(0, remain));
      if (remain <= 0) void submit(-1);
    };
    tick();
    const t = setInterval(tick, 100);
    return () => clearInterval(t);
  }, [phase, selected, start, shownAt, submit]);

  // ---- focus: question heading on a new question, Next button on feedback ----
  useEffect(() => {
    if (phase === "question") qHead.current?.focus({ preventScroll: true });
    if (phase === "feedback") nextBtn.current?.focus({ preventScroll: true });
  }, [phase, i]);

  // ---- keyboard: A-D or 1-4 to answer, Enter for next ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || dialog.current?.open) return;
      if (phase === "question" && selected === null) {
        const k = e.key.toLowerCase();
        const idx = "abcd".indexOf(k) >= 0 && k.length === 1 ? "abcd".indexOf(k) : "1234".indexOf(k) >= 0 && k.length === 1 ? "1234".indexOf(k) : -1;
        if (idx >= 0) { e.preventDefault(); void submit(idx); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, selected, submit]);

  const leave = () => { dialog.current?.close(); router.push("/"); };

  const q = start?.questions[i];
  const ans = phase === "feedback" ? answers[answers.length - 1] : undefined;

  const shareText = useMemo(() => {
    if (!summary) return "";
    const squares = summary.grid.map((g) => (g === "hit" ? "🟩" : "🟪")).join("");
    const head = summary.mode === "daily" ? `Grrand Quiz daily ${summary.day}` : `Grrand Quiz · ${catName ?? "Round"}`;
    return `${head}\n${summary.correct}/${summary.total} · ${summary.points.toLocaleString()} pts\n${squares}\nPlay: ${SITE.url}`;
  }, [summary, catName]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(shareText); setCopied(true); setTimeout(() => setCopied(false), 2500); }
    catch { window.prompt("Copy your result:", shareText); }
  };

  // ================= render =================
  if (phase === "loading") {
    return <div className="round"><p className="notice" role="status">Getting your questions…</p></div>;
  }

  if (phase === "error") {
    return (
      <div className="round">
        <div className="error" role="alert">
          <p><strong>Couldn’t start the round.</strong></p>
          <p>{error}</p>
          <div className="actions">
            <button className="btn" onClick={() => void begin()}>Try again</button>
            <Link className="btn secondary" href="/">Back home</Link>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "summary" && summary) {
    const others = cats.filter((c) => c.id !== summary.category).slice(0, 3);
    const d = summary.detail;
    return (
      <div className="round">
        <div className="summary">
          <section className="stage" aria-labelledby="sum-h">
            <h1 id="sum-h" className="sr">Round complete</h1>
            <p className="muted">{summary.mode === "daily" ? `Daily round · ${summary.day}` : catName}{summary.replay ? " · already played today" : ""}</p>
            <p className="tally">{summary.correct}<small>of {summary.total} correct</small></p>
            <div className="grid-result" role="img" aria-label={summary.grid.map((g, k) => `Question ${k + 1} ${g === "hit" ? "correct" : "missed"}`).join(", ")}>
              {summary.grid.map((g, k) => (<span key={k} className={`cell ${g}`}>{g === "hit" ? <Check /> : <Dash />}</span>))}
            </div>
            <table className="breakdown">
              <tbody>
                {d && (<>
                  <tr><th scope="row">Question points</th><td>{d.base.toLocaleString()}</td></tr>
                  {d.perfect > 0 && <tr><th scope="row">Perfect round bonus</th><td>+{d.perfect.toLocaleString()}</td></tr>}
                  {d.fresh < 1 && <tr><th scope="row">Repeat-category this week</th><td>×{d.fresh}</td></tr>}
                </>)}
                <tr><th scope="row">Round total</th><td>{summary.points.toLocaleString()}</td></tr>
              </tbody>
            </table>
          </section>

          <div className="actions">
            <a className="btn" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer">Share on WhatsApp</a>
            <button className="btn secondary" onClick={() => void copy()}>{copied ? "Copied" : "Copy result"}</button>
            <p role="status" className="sr">{copied ? "Result copied to clipboard" : ""}</p>
          </div>

          <p className="muted" style={{ color: "var(--text-muted)", margin: 0 }}>
            Points are saved on this device. Rankings open once accounts are switched on.
          </p>

          <section aria-labelledby="more-h">
            <h2 id="more-h" style={{ marginBlockEnd: "var(--s3)" }}>{summary.mode === "daily" ? "Keep going" : "Try another"}</h2>
            <ul className="suggest">
              {others.map((c) => (<li key={c.id}><Link href={`/play/${c.id}`}>{c.name} <Arrow /></Link></li>))}
              <li><Link href="/">All categories <Arrow /></Link></li>
            </ul>
          </section>
        </div>
      </div>
    );
  }

  if (!start || !q) return null;
  const seconds = Math.ceil(left / 1000);
  const locked = selected !== null;

  return (
    <div className="round">
      <div className="round-top">
        <div className="round-head">
          <div className="segs" role="img" aria-label={`Question ${i + 1} of ${start.questions.length}`}>
            {start.questions.map((_, k) => {
              const a = answers[k];
              const cls = a ? (a.correct ? "hit" : "miss") : k === i ? "now" : "";
              return <span key={k} className={`seg ${cls}`} />;
            })}
          </div>
          <button className="btn secondary leave" onClick={() => dialog.current?.showModal()}>Leave</button>
        </div>
        <div className={`timer${seconds <= 5 && phase === "question" ? " low" : ""}`}>
          <div className="timer-track" aria-hidden="true">
            <div className="timer-fill" style={{ ["--left" as string]: phase === "question" ? left / (start.limitSec * 1000) : 0 }} />
          </div>
          <span className="timer-num" aria-hidden="true">{phase === "question" ? `${seconds}s` : ""}</span>
          <span className="sr" role="status">{phase === "question" && (seconds === 10 || seconds === 5) ? `${seconds} seconds left` : ""}</span>
        </div>
      </div>

      {i === 0 && start.repeats > 0 && mode === "category" && (
        <p className="notice">{start.repeats === 1 ? "1 question here you’ve seen before." : `${start.repeats} questions here you’ve seen before.`} New ones are on the way.</p>
      )}

      <div className="qstage">
        <div className="qmeta">
          <span>Question {i + 1} of {start.questions.length}</span>
          <span>{q.diff === "E" ? "Easy" : q.diff === "M" ? "Medium" : "Hard"}</span>
        </div>
        <h1 className="qtext" ref={qHead} tabIndex={-1}>{q.q}</h1>
      </div>

      <ul className="opts" aria-label="Answers">
        {q.options.map((o, k) => {
          const revealed = !!ans;
          const right = revealed && k === ans!.correctIndex;
          const wrong = revealed && k === ans!.picked && !ans!.correct;
          return (
            <li key={k}>
              <button
                className={`opt${right ? " right" : ""}${wrong ? " wrong" : ""}`}
                aria-pressed={selected === k}
                disabled={locked}
                onClick={() => void submit(k)}
              >
                <span className="letter" aria-hidden="true">{LETTERS[k]}</span>
                <span className="label">{o}</span>
                <span aria-hidden="true">{right ? <Check /> : wrong ? <Cross /> : null}</span>
                {right && <span className="sr">Correct answer</span>}
                {wrong && <span className="sr">Your answer, incorrect</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {retry && (
        <div className="error" role="alert">
          <p><strong>{retry}</strong></p>
          <button className="btn" onClick={() => (phase === "question" ? void submit(selected ?? -1) : void goNext())}>Retry</button>
        </div>
      )}

      {phase === "feedback" && ans && (
        <>
          <div className={`feedback ${ans.correct ? "good" : "bad"}`} role="status">
            <h3>
              <span>{ans.timedOut ? "Time’s up" : ans.correct ? "Correct" : "Not this time"}</span>
              <span className="pts">{ans.points > 0 ? `+${ans.points}` : "0"}</span>
            </h3>
            <p>{ans.fact}</p>
          </div>
          <div className="round-foot">
            <button ref={nextBtn} className="btn block" onClick={() => void goNext()}>
              {i + 1 >= start.questions.length ? "See result" : "Next question"} <Arrow />
            </button>
          </div>
        </>
      )}

      <dialog ref={dialog} className="leave-dialog" aria-labelledby="leave-h">
        <h2 id="leave-h">Leave this round?</h2>
        <p style={{ marginBlockStart: "var(--s2)" }}>Your progress is saved on this device. The clock keeps running on the question you’re on.</p>
        <div className="actions">
          <button className="btn" onClick={() => dialog.current?.close()}>Keep playing</button>
          <button className="btn secondary" onClick={leave}>Leave round</button>
        </div>
      </dialog>
    </div>
  );
}
