"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Arrow, Check, Dash } from "./Icons";
import { load, type Local } from "@/lib/local";
import { lusakaDay, msUntilNextLusakaDay } from "@/lib/daily";

export type CatInfo = { id: string; name: string; blurb: string; ids: string[] };

function clock(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
}

export default function Home({ cats }: { cats: CatInfo[] }) {
  const [local, setLocal] = useState<Local | null>(null);
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    setLocal(load());
    const tick = () => setLeft(msUntilNextLusakaDay());
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const today = lusakaDay();
  const done = local?.daily[today];
  const active = local?.active;
  const seen = new Set(local?.seen ?? []);

  return (
    <>
      <h1>Five questions. Twenty seconds each.</h1>
      <p className="lede">One daily round everyone plays together, plus twelve categories to master.</p>

      {active && (
        <div className="resume">
          <p>You left a round unfinished.</p>
          <Link className="btn" href={active.start.mode === "daily" ? "/play/daily" : `/play/${active.start.category}`}>
            Resume <Arrow />
          </Link>
        </div>
      )}

      <section className="stage daily" aria-labelledby="daily-h">
        <div className="daily-meta">
          <span>Today’s round · {today}</span>
          <span>
            Next in <span className="countdown" aria-label="time until the next daily round">{left === null ? "--:--:--" : clock(left)}</span>
          </span>
        </div>
        <h2 id="daily-h">Daily round</h2>
        {done ? (
          <>
            <p className="muted">
              You got {done.correct} of {done.total} for {done.points.toLocaleString()} points.
            </p>
            <div className="grid-result" role="img" aria-label={done.grid.map((g, i) => `Question ${i + 1} ${g === "hit" ? "correct" : "missed"}`).join(", ")}>
              {done.grid.map((g, i) => (
                <span key={i} className={`cell ${g}`}>{g === "hit" ? <Check /> : <Dash />}</span>
              ))}
            </div>
            <Link className="btn on-stage" href="/play/daily">See result and share <Arrow /></Link>
          </>
        ) : (
          <>
            <p className="muted">The same five questions for everyone in Zambia and beyond, across five categories.</p>
            <Link className="btn on-stage" href="/play/daily">Play today’s round <Arrow /></Link>
          </>
        )}
      </section>

      <div className="section-title">
        <h2>Categories</h2>
        <span>{cats.length} to master</span>
      </div>
      <ul className="cats">
        {cats.map((c) => {
          const unseen = c.ids.filter((id) => !seen.has(id)).length;
          return (
            <li key={c.id}>
              <Link href={`/play/${c.id}`} className="cat" aria-label={`${c.name}. ${c.blurb}. ${local ? `${unseen} of ${c.ids.length} questions new to you` : `${c.ids.length} questions`}`}>
                <strong>{c.name}</strong>
                <small>{c.blurb}</small>
                <span className="tags">
                  <span className={unseen > 0 ? "pill fresh" : "pill"}>
                    {local ? (unseen > 0 ? `${unseen} new` : "All seen") : `${c.ids.length} Qs`}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
