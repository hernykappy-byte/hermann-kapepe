"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { call, useAccount } from "./Account";

type Team = { id: string; name: string; kind: string; members: number; joined: boolean };
type Data = { enabled: boolean; signedIn: boolean; teams: Team[] };

export default function TeamsView() {
  const { me } = useAccount();
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const r = await call<Data>("/api/teams");
    if (r.ok) setData(r.data); else setErr(r.data.error || "Could not load teams.");
  }, []);
  useEffect(() => { if (me?.enabled) void load(); }, [me?.enabled, load]);

  if (me && !me.enabled) {
    return (
      <div className="empty">
        <p><span className="status">Needs setup</span></p>
        <h2 style={{ marginBlockEnd: "var(--s2)" }}>Not switched on yet</h2>
        <p style={{ marginBlockEnd: 0 }}>Teams arrive with accounts. Nothing is listed here until real teams exist.</p>
      </div>
    );
  }

  async function act(url: string, body: unknown) {
    setBusy(true); setErr(null);
    const r = await call(url, body);
    if (!r.ok) setErr(r.data.error || "That didn’t work.");
    await load();
    setBusy(false);
  }

  return (
    <>
      {me?.user ? (
        <form
          className="panel"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const f = new FormData(form);
            await act("/api/teams", { name: f.get("name"), kind: f.get("kind") });
            form.reset();
          }}
        >
          <h2>Start a team</h2>
          <div className="field">
            <label htmlFor="team-name">Team name</label>
            <input id="team-name" name="name" maxLength={40} required />
          </div>
          <div className="field">
            <label htmlFor="team-kind">Type</label>
            <select id="team-kind" name="kind" defaultValue="school">
              <option value="school">School</option>
              <option value="class">Class</option>
              <option value="crew">Crew</option>
            </select>
          </div>
          <button className="btn" disabled={busy}>Create team</button>
        </form>
      ) : me ? (
        <p className="panel" style={{ marginBlockStart: "var(--s4)" }}><Link href="/me">Make an account or sign in</Link> to start or join a team.</p>
      ) : null}
      {err && <p role="alert" className="form-err">{err}</p>}
      {!data && !err && <p role="status">Loading…</p>}
      {data && data.teams.length === 0 && (
        <div className="empty"><h2 style={{ marginBlockEnd: "var(--s2)" }}>No teams yet</h2><p style={{ marginBlockEnd: 0 }}>Start the first one for your school, class or crew.</p></div>
      )}
      {data && data.teams.length > 0 && (
        <ul className="team-list">
          {data.teams.map((t) => (
            <li key={t.id} className="team">
              <div>
                <strong>{t.name}</strong>
                <small className="muted"> · {t.kind} · {t.members} {t.members === 1 ? "member" : "members"}</small>
              </div>
              {data.signedIn && (
                <button className="btn secondary" disabled={busy} onClick={() => act("/api/teams/join", { teamId: t.id, leave: t.joined })}>
                  {t.joined ? "Leave" : "Join"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {data && data.teams.length > 0 && <p className="muted">See how teams rank on <Link href="/ranks">Ranks</Link>.</p>}
    </>
  );
}
