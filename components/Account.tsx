"use client";
import { useCallback, useEffect, useState } from "react";
import { CITIES } from "@/lib/config";

export type Me = { enabled: boolean; user: { username: string; city: string | null } | null };

async function call<T>(url: string, body?: unknown): Promise<{ ok: boolean; data: T & { error?: string } }> {
  try {
    const r = await fetch(url, body === undefined ? { cache: "no-store" } : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    return { ok: r.ok, data: await r.json() };
  } catch {
    return { ok: false, data: { error: "No connection. Try again." } as never };
  }
}
export { call };

export function useAccount() {
  const [me, setMe] = useState<Me | null>(null);
  const refresh = useCallback(async () => {
    const r = await call<Me>("/api/auth/me");
    setMe(r.ok ? r.data : { enabled: false, user: null });
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  return { me, refresh };
}

export default function AccountPanel() {
  const { me, refresh } = useAccount();
  const [mode, setMode] = useState<"in" | "up">("up");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!me) return <div className="panel"><h2>Account</h2><p role="status">Loading…</p></div>;
  if (!me.enabled) {
    return (
      <div className="panel">
        <h2>Account</h2>
        <p><span className="status">Needs setup</span>Sign in to keep your place in school and city rankings. This switches on as soon as the database is connected.</p>
      </div>
    );
  }
  if (me.user) {
    return (
      <div className="panel">
        <h2>Signed in as {me.user.username}</h2>
        <p>{me.user.city ? `${me.user.city}. ` : ""}Your daily round scores now count on the Ranks board.</p>
        <button className="btn secondary" disabled={busy} onClick={async () => { setBusy(true); await call("/api/auth/logout", {}); await refresh(); setBusy(false); }}>Sign out</button>
      </div>
    );
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true); setErr(null);
    const body = { username: f.get("username"), pin: f.get("pin"), city: f.get("city") || null };
    const r = await call(mode === "up" ? "/api/auth/register" : "/api/auth/login", body);
    setBusy(false);
    if (!r.ok) { setErr(r.data.error || "Could not sign in."); return; }
    await refresh();
  }

  return (
    <div className="panel">
      <h2>{mode === "up" ? "Make an account" : "Sign in"}</h2>
      <p className="muted">A username and a 6-digit PIN. No email, no phone number.</p>
      <form onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="acc-user">Username</label>
          <input id="acc-user" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={20} required />
          {mode === "up" && <span className="hint">3 to 20 letters, numbers or underscores. It is shown on the boards.</span>}
        </div>
        <div className="field">
          <label htmlFor="acc-pin">6-digit PIN</label>
          <input id="acc-pin" name="pin" type="password" inputMode="numeric" pattern="[0-9]*" maxLength={6} autoComplete={mode === "up" ? "new-password" : "current-password"} required />
          {mode === "up" && <span className="hint">There is no reset, so pick one you will remember.</span>}
        </div>
        {mode === "up" && (
          <div className="field">
            <label htmlFor="acc-city">City (optional)</label>
            <select id="acc-city" name="city" defaultValue="">
              <option value="">Prefer not to say</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}
        {err && <p role="alert" className="form-err">{err}</p>}
        <button className="btn block" disabled={busy}>{busy ? "One moment…" : mode === "up" ? "Create account" : "Sign in"}</button>
      </form>
      <p style={{ marginBlockEnd: 0 }}>
        <button className="link-btn" type="button" onClick={() => { setMode(mode === "up" ? "in" : "up"); setErr(null); }}>
          {mode === "up" ? "Already have an account? Sign in" : "New here? Make an account"}
        </button>
      </p>
    </div>
  );
}
