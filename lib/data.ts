import type { Db } from "./db";
import { hashPin, checkPin } from "./auth";
import { CITIES, TEAM_KINDS } from "./config";
import { lusakaDay } from "./daily";
import type { FinishResponse } from "./types";

type Fail = { error: string; status: number };
export type Profile = { id: string; username: string; city: string | null };

const USERNAME = /^[A-Za-z0-9_]{3,20}$/;
const PIN = /^\d{6}$/;
const MAX_FAILS = 5;
const LOCK_MIN = 15;
const MAX_TEAMS_PER_PLAYER = 5;
const FRESH_MS = 10 * 60_000; // a finished round can be ranked for 10 minutes

const isUnique = (e: unknown) => (e as { code?: string })?.code === "23505" || /unique|duplicate/i.test(String((e as Error)?.message));

export async function register(db: Db, username: unknown, pin: unknown, city: unknown): Promise<Profile | Fail> {
  if (typeof username !== "string" || !USERNAME.test(username)) return { error: "Username: 3 to 20 letters, numbers or underscores.", status: 400 };
  if (typeof pin !== "string" || !PIN.test(pin)) return { error: "PIN must be exactly 6 digits.", status: 400 };
  const c = typeof city === "string" && (CITIES as readonly string[]).includes(city) ? city : null;
  try {
    const r = await db.query<Profile>(`insert into profiles(username, pin_hash, city) values ($1,$2,$3) returning id, username, city`, [username, hashPin(pin), c]);
    return r.rows[0];
  } catch (e) {
    if (isUnique(e)) return { error: "That username is taken.", status: 409 };
    throw e;
  }
}

export async function login(db: Db, username: unknown, pin: unknown): Promise<Profile | Fail> {
  const bad: Fail = { error: "Wrong username or PIN.", status: 401 };
  if (typeof username !== "string" || typeof pin !== "string" || !USERNAME.test(username) || !PIN.test(pin)) return bad;
  const r = await db.query<Profile & { pin_hash: string; locked: boolean }>(
    `select id, username, city, pin_hash, (locked_until is not null and locked_until > now()) as locked from profiles where lower(username) = lower($1)`, [username]);
  const p = r.rows[0];
  if (p?.locked) return { error: `Too many wrong tries. Try again in ${LOCK_MIN} minutes.`, status: 429 };
  const ok = checkPin(pin, p?.pin_hash ?? null);
  if (!p) return bad;
  if (!ok) {
    await db.query(
      `update profiles set
         locked_until = case when fail_count + 1 >= $2 then now() + ($3 || ' minutes')::interval else locked_until end,
         fail_count = case when fail_count + 1 >= $2 then 0 else fail_count + 1 end
       where id = $1`, [p.id, MAX_FAILS, String(LOCK_MIN)]);
    return bad;
  }
  await db.query(`update profiles set fail_count = 0, locked_until = null where id = $1`, [p.id]);
  return { id: p.id, username: p.username, city: p.city };
}

export async function getProfile(db: Db, id: string): Promise<Profile | null> {
  const r = await db.query<Profile>(`select id, username, city from profiles where id::text = $1`, [id]);
  return r.rows[0] ?? null;
}

export async function recordResult(db: Db, profileId: string, fin: FinishResponse, rid: string, shownAt: number, now = new Date()): Promise<{ recorded: boolean; reason?: string } | Fail> {
  if (now.getTime() - shownAt > FRESH_MS) return { error: "This round finished too long ago to be ranked.", status: 409 };
  if (fin.mode === "daily" && fin.day !== lusakaDay(now)) return { error: "Only today's daily round can be ranked.", status: 409 };
  const r = await db.query(
    `insert into round_results(round_key, profile_id, mode, category, day, correct, total, points)
     values ($1,$2,$3,$4,$5,$6,$7,$8) on conflict do nothing returning id`,
    [rid, profileId, fin.mode, fin.category, fin.mode === "daily" ? fin.day : null, fin.correct, fin.total, fin.points]);
  if (r.rows.length) return { recorded: true };
  return { recorded: false, reason: fin.mode === "daily" ? "You already have a ranked score for today." : "This round was already saved." };
}

export type BoardRow = { username: string; city: string | null; points: number; days?: number };
export type Window = "daily" | "weekly" | "all";

function dayMinus(day: string, n: number): string {
  return new Date(Date.parse(day + "T00:00:00Z") - n * 86400000).toISOString().slice(0, 10);
}
const from = (w: Window, today: string) => (w === "daily" ? today : w === "weekly" ? dayMinus(today, 6) : "2000-01-01");

/** Boards count daily rounds only, so grinding practice rounds cannot buy a rank. */
export async function playerBoard(db: Db, w: Window, city: string | null, now = new Date()): Promise<BoardRow[]> {
  const today = lusakaDay(now);
  const r = await db.query<BoardRow>(
    `select p.username, p.city, sum(r.points)::int as points, count(*)::int as days
     from round_results r join profiles p on p.id = r.profile_id
     where r.mode = 'daily' and r.day >= $1::date and r.day <= $2::date and ($3::text is null or p.city = $3)
     group by p.id, p.username, p.city
     order by points desc, min(r.played_at) asc limit 50`, [from(w, today), today, city]);
  return r.rows;
}

export type TeamBoardRow = { id: string; name: string; kind: string; avg_points: number; players: number };
export async function teamBoard(db: Db, w: Window, now = new Date()): Promise<TeamBoardRow[]> {
  const today = lusakaDay(now);
  const r = await db.query<TeamBoardRow>(
    `select t.id::text as id, t.name, t.kind, round(avg(r.points))::int as avg_points, count(distinct r.profile_id)::int as players
     from teams t join team_members m on m.team_id = t.id
     join round_results r on r.profile_id = m.profile_id and r.mode = 'daily' and r.day >= $1::date and r.day <= $2::date
     group by t.id, t.name, t.kind order by avg_points desc, players desc, t.name limit 50`, [from(w, today), today]);
  return r.rows;
}

export type TeamRow = { id: string; name: string; kind: string; members: number; joined: boolean };
export async function listTeams(db: Db, me: string | null): Promise<TeamRow[]> {
  const r = await db.query<TeamRow>(
    `select t.id::text as id, t.name, t.kind, count(m.profile_id)::int as members,
            coalesce(bool_or(m.profile_id::text = $1), false) as joined
     from teams t left join team_members m on m.team_id = t.id
     group by t.id, t.name, t.kind, t.created_at order by members desc, t.created_at desc limit 100`, [me]);
  return r.rows;
}

export async function createTeam(db: Db, me: string, name: unknown, kind: unknown): Promise<{ id: string } | Fail> {
  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 40) return { error: "Team name: 2 to 40 characters.", status: 400 };
  if (typeof kind !== "string" || !(TEAM_KINDS as readonly string[]).includes(kind)) return { error: "Pick school, class or crew.", status: 400 };
  const n = await db.query<{ n: number }>(`select count(*)::int as n from team_members where profile_id::text = $1`, [me]);
  if (n.rows[0].n >= MAX_TEAMS_PER_PLAYER) return { error: `You can be in up to ${MAX_TEAMS_PER_PLAYER} teams.`, status: 409 };
  try {
    const t = await db.query<{ id: string }>(`insert into teams(name, kind, created_by) values ($1,$2,$3) returning id::text as id`, [name.trim(), kind, me]);
    await db.query(`insert into team_members(team_id, profile_id) values ($1,$2)`, [t.rows[0].id, me]);
    return { id: t.rows[0].id };
  } catch (e) {
    if (isUnique(e)) return { error: "A team with that name exists. Join it or pick another name.", status: 409 };
    throw e;
  }
}

export async function joinTeam(db: Db, me: string, teamId: unknown, leave = false): Promise<{ ok: true } | Fail> {
  if (typeof teamId !== "string" || !/^[0-9a-f-]{36}$/i.test(teamId)) return { error: "Unknown team.", status: 400 };
  if (leave) {
    await db.query(`delete from team_members where team_id::text = $1 and profile_id::text = $2`, [teamId, me]);
    return { ok: true };
  }
  const t = await db.query(`select 1 from teams where id::text = $1`, [teamId]);
  if (!t.rows.length) return { error: "Unknown team.", status: 404 };
  const n = await db.query<{ n: number }>(`select count(*)::int as n from team_members where profile_id::text = $1`, [me]);
  const already = await db.query(`select 1 from team_members where team_id::text = $1 and profile_id::text = $2`, [teamId, me]);
  if (!already.rows.length && n.rows[0].n >= MAX_TEAMS_PER_PLAYER) return { error: `You can be in up to ${MAX_TEAMS_PER_PLAYER} teams.`, status: 409 };
  await db.query(`insert into team_members(team_id, profile_id) values ($1::uuid,$2::uuid) on conflict do nothing`, [teamId, me]);
  return { ok: true };
}

export async function playersToday(db: Db, now = new Date()): Promise<number> {
  const r = await db.query<{ n: number }>(`select count(*)::int as n from round_results where mode = 'daily' and day = $1::date`, [lusakaDay(now)]);
  return r.rows[0].n;
}
