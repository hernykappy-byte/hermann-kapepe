import { cookies } from "next/headers";
import { getDb, type Db } from "./db";
import { readSession, makeSession, SESSION_COOKIE, SESSION_DAYS } from "./auth";
import { getProfile, type Profile } from "./data";

const noStore = { "Cache-Control": "no-store" };
export const json = (body: unknown, status = 200) => Response.json(body, { status, headers: noStore });
export const NOT_ENABLED = () => json({ error: "Accounts are not switched on yet.", enabled: false }, 503);

export async function readBody(req: Request): Promise<Record<string, unknown> | null> {
  if (!(req.headers.get("content-type") || "").includes("application/json")) return null;
  try { const b = await req.json(); return b && typeof b === "object" ? (b as Record<string, unknown>) : null; } catch { return null; }
}

export async function withDb<T>(fn: (db: Db) => Promise<T>): Promise<T | Response> {
  let db: Db | null;
  try { db = await getDb(); } catch { return json({ error: "The database is not reachable right now." }, 503); }
  if (!db) return NOT_ENABLED();
  try { return await fn(db); } catch { return json({ error: "Something went wrong on our side. Try again." }, 500); }
}

export async function currentUser(db: Db): Promise<Profile | null> {
  const id = readSession((await cookies()).get(SESSION_COOKIE)?.value);
  return id ? getProfile(db, id) : null;
}

export async function startSession(profileId: string) {
  (await cookies()).set(SESSION_COOKIE, makeSession(profileId), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_DAYS * 86400,
  });
}
export async function endSession() { (await cookies()).delete(SESSION_COOKIE); }
