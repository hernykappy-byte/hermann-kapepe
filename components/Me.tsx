"use client";
import { useEffect, useState } from "react";
import { load, streak, wipe, type Local } from "@/lib/local";
import AccountPanel from "./Account";

export default function Me() {
  const [s, setS] = useState<Local | null>(null);
  useEffect(() => setS(load()), []);
  if (!s) return <p role="status">Loading…</p>;

  const acc = s.answered ? Math.round((s.correct / s.answered) * 100) : 0;
  const empty = s.rounds === 0;
  return (
    <>
      <h1>Your stats</h1>
      <p className="lede">These numbers are kept on this device. Signing in adds your daily round to the rankings.</p>
      {empty ? (
        <div className="empty">
          <h2>No rounds yet</h2>
          <p>Play one round and your numbers show up here.</p>
        </div>
      ) : (
        <div className="stats">
          <div className="stat"><b>{streak(s)}</b><span>Day streak</span></div>
          <div className="stat"><b>{s.rounds}</b><span>Rounds played</span></div>
          <div className="stat"><b>{s.points.toLocaleString()}</b><span>Total points</span></div>
          <div className="stat"><b>{s.best.toLocaleString()}</b><span>Best round</span></div>
          <div className="stat"><b>{acc}%</b><span>Answered correctly</span></div>
          <div className="stat"><b>{s.perfects}</b><span>Perfect rounds</span></div>
        </div>
      )}
      <AccountPanel />
      {!empty && (
        <button
          className="btn secondary"
          onClick={() => {
            if (window.confirm("Erase all stats and history on this device?")) { wipe(); setS(load()); }
          }}
        >
          Erase my data on this device
        </button>
      )}
    </>
  );
}
