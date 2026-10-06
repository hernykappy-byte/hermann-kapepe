"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CITIES } from "@/lib/config";
import { call, useAccount } from "./Account";

type P = { username: string; city: string | null; points: number; days?: number };
type T = { id: string; name: string; kind: string; avg_points: number; players: number };
type Data = { enabled: boolean; players: P[]; teams: T[]; error?: string };
const WINDOWS = [["daily", "Today"], ["weekly", "7 days"], ["all", "All time"]] as const;

export default function Boards() {
  const { me } = useAccount();
  const [w, setW] = useState<(typeof WINDOWS)[number][0]>("daily");
  const [city, setCity] = useState("");
  const [view, setView] = useState<"players" | "teams">("players");
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setData(null); setErr(null);
    call<Data>(`/api/ranks?w=${w}${city ? `&city=${encodeURIComponent(city)}` : ""}`).then((r) => {
      if (!live) return;
      if (r.ok) setData(r.data); else setErr(r.data.error || "Could not load the board.");
    });
    return () => { live = false; };
  }, [w, city]);

  if (me && !me.enabled) {
    return (
      <div className="empty">
        <p><span className="status">Needs setup</span></p>
        <h2 style={{ marginBlockEnd: "var(--s2)" }}>Not switched on yet</h2>
        <p style={{ marginBlockEnd: 0 }}>Rankings need accounts so every score is tied to a real player. Your own best scores are on <Link href="/me">Me</Link>.</p>
      </div>
    );
  }

  const rows = view === "players" ? data?.players : data?.teams;
  return (
    <>
      <div className="controls">
        <div role="tablist" aria-label="Time window" className="seg-tabs">
          {WINDOWS.map(([id, label]) => (
            <button key={id} role="tab" aria-selected={w === id} className="seg-tab" onClick={() => setW(id)}>{label}</button>
          ))}
        </div>
        <div role="tablist" aria-label="Board type" className="seg-tabs">
          <button role="tab" aria-selected={view === "players"} className="seg-tab" onClick={() => setView("players")}>Players</button>
          <button role="tab" aria-selected={view === "teams"} className="seg-tab" onClick={() => setView("teams")}>Teams</button>
        </div>
        {view === "players" && (
          <label className="city-filter">
            <span className="sr">City</span>
            <select value={city} onChange={(e) => setCity(e.target.value)} aria-label="Filter by city">
              <option value="">All cities</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        )}
      </div>
      <p className="muted">{view === "teams" ? "Team score is the average of its members’ daily rounds, so size gives no edge." : "Counts daily rounds only, so practice rounds can’t buy a rank."}{w === "daily" ? "" : " Points are added up across days."}</p>
      {err && <p role="alert" className="form-err">{err}</p>}
      {!data && !err && <p role="status">Loading…</p>}
      {data && rows && rows.length === 0 && (
        <div className="empty">
          <h2 style={{ marginBlockEnd: "var(--s2)" }}>No scores here yet</h2>
          <p style={{ marginBlockEnd: 0 }}>{me?.user ? <>Play the <Link href="/play/daily">daily round</Link> to take the first spot.</> : <><Link href="/me">Make an account</Link>, then play the daily round to take the first spot.</>}</p>
        </div>
      )}
      {data && rows && rows.length > 0 && (
        <table className="table">
          <thead><tr><th className="num" scope="col">#</th><th scope="col">{view === "players" ? "Player" : "Team"}</th><th className="num" scope="col">{view === "players" ? "Points" : "Average"}</th></tr></thead>
          <tbody>
            {view === "players"
              ? data.players.map((r, i) => (
                  <tr key={r.username} className={me?.user?.username.toLowerCase() === r.username.toLowerCase() ? "me" : undefined}>
                    <td className="num">{i + 1}</td>
                    <td>{r.username}{r.city ? <small className="muted"> · {r.city}</small> : null}</td>
                    <td className="num">{r.points.toLocaleString()}</td>
                  </tr>
                ))
              : data.teams.map((r, i) => (
                  <tr key={r.id}>
                    <td className="num">{i + 1}</td>
                    <td>{r.name}<small className="muted"> · {r.kind} · {r.players} {r.players === 1 ? "player" : "players"}</small></td>
                    <td className="num">{r.avg_points.toLocaleString()}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      )}
    </>
  );
}
