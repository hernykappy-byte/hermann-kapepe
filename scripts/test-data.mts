// Tests the accounts / results / boards / teams layer on an in-process Postgres.
// Run with a 16+ character secret: GRRAND_SECRET=... npm run test:data
import { PGlite } from "@electric-sql/pglite";
import { SCHEMA } from "../lib/schema.ts";
import * as D from "../lib/data.ts";
import { makeSession, readSession } from "../lib/auth.ts";
import type { FinishResponse } from "../lib/types.ts";

const pg = new PGlite();
await pg.exec(SCHEMA);
const db = { query: async (sql: string, p?: unknown[]) => ({ rows: (await pg.query(sql, p)).rows as never[] }) };

let fail = 0;
const ok = (name: string, pass: boolean, extra?: unknown) => { console.log(`${pass ? "ok  " : "FAIL"} ${name}`); if (!pass) { fail++; if (extra !== undefined) console.log("   ", extra); } };
const isErr = (r: unknown, status?: number): r is { error: string; status: number } => !!r && typeof r === "object" && "error" in r && (status === undefined || (r as { status: number }).status === status);

const NOW = new Date("2026-10-07T10:00:00Z"); // Lusaka day 2026-10-07
const fin = (o: Partial<FinishResponse> = {}): FinishResponse => ({ correct: 4, total: 5, basePoints: 3000, perfectBonus: 0, freshness: 1, points: 3000, grid: ["hit", "hit", "hit", "hit", "miss"], day: "2026-10-07", category: null, mode: "daily", questionIds: [], ...o });

// accounts
ok("short username rejected", isErr(await D.register(db, "ab", "123456", null), 400));
ok("5-digit PIN rejected", isErr(await D.register(db, "alice", "12345", null), 400));
ok("letters in PIN rejected", isErr(await D.register(db, "alice", "12a456", null), 400));
const alice = await D.register(db, "alice", "123456", "Lusaka");
const bob = await D.register(db, "bob_b", "654321", "Kitwe");
const carol = await D.register(db, "carol", "111111", "<script>");
if (isErr(alice) || isErr(bob) || isErr(carol)) throw new Error("register failed");
ok("registered", true);
ok("unknown city stored as null", carol.city === null);
ok("duplicate name (case-insensitive) rejected", isErr(await D.register(db, "ALICE", "123456", null), 409));
const pinRow = await pg.query<{ pin_hash: string }>(`select pin_hash from profiles where username='alice'`);
ok("PIN is hashed, not stored", !pinRow.rows[0].pin_hash.includes("123456") && pinRow.rows[0].pin_hash.startsWith("s1$"));

// login + lockout
const li = await D.login(db, "Alice", "123456");
ok("login works, case-insensitive name", !isErr(li) && (li as D.Profile).id === alice.id);
ok("wrong PIN rejected", isErr(await D.login(db, "alice", "000000"), 401));
ok("unknown user gives the same error", (await D.login(db, "nobody", "000000") as { error: string }).error === (await D.login(db, "alice", "000001") as { error: string }).error);
for (let i = 0; i < 3; i++) await D.login(db, "alice", "999999");
ok("locked after repeated failures, even with the right PIN", isErr(await D.login(db, "alice", "123456"), 429));
await pg.query(`update profiles set locked_until = now() - interval '1 minute' where username='alice'`);
ok("lock expires", !isErr(await D.login(db, "alice", "123456")));

// sessions
const sess = makeSession(alice.id);
ok("session round-trips", readSession(sess) === alice.id);
ok("tampered session rejected", readSession(sess.slice(0, -2) + "xx") === null);
ok("expired session rejected", readSession(makeSession(alice.id, Date.now() - 40 * 86400_000)) === null);
ok("profile lookup", (await D.getProfile(db, alice.id))?.username === "alice");

// results
const t = NOW.getTime();
ok("daily saved", (await D.recordResult(db, alice.id, fin({ points: 3000 }), "rid-a1", t, NOW) as { recorded: boolean }).recorded === true);
const dup = await D.recordResult(db, alice.id, fin({ points: 9999 }), "rid-a2", t, NOW) as { recorded: boolean };
ok("second daily same day not recorded", dup.recorded === false);
ok("same round token cannot be saved twice", (await D.recordResult(db, alice.id, fin({ mode: "category", day: null, category: "zambia" }), "rid-a1", t, NOW) as { recorded: boolean }).recorded === false);
ok("yesterday's daily rejected", isErr(await D.recordResult(db, bob.id, fin({ day: "2026-10-06" }), "rid-b0", t, NOW), 409));
ok("stale round rejected", isErr(await D.recordResult(db, bob.id, fin(), "rid-b1", t - 11 * 60_000, NOW), 409));
await D.recordResult(db, bob.id, fin({ points: 4200, correct: 5 }), "rid-b2", t, NOW);
await D.recordResult(db, carol.id, fin({ points: 1500, correct: 2 }), "rid-c1", t, NOW);
await D.recordResult(db, alice.id, fin({ mode: "category", day: null, category: "zambia", points: 99999 }), "rid-a3", t, NOW);
ok("practice rounds recorded", true);
const prev = new Date("2026-10-06T10:00:00Z");
await D.recordResult(db, carol.id, fin({ day: "2026-10-06", points: 3800 }), "rid-c0", prev.getTime(), prev);

// boards
const daily = await D.playerBoard(db, "daily", null, NOW);
ok("daily board order", daily.map((r) => r.username).join() === "bob_b,alice,carol", daily);
ok("practice points never reach the board", daily.every((r) => r.points < 10000));
const lus = await D.playerBoard(db, "daily", "Lusaka", NOW);
ok("city filter", lus.length === 1 && lus[0].username === "alice");
const weekly = await D.playerBoard(db, "weekly", null, NOW);
ok("weekly sums daily rounds", weekly.find((r) => r.username === "carol")?.points === 5300 && weekly[0].username === "carol", weekly);
ok("all-time board", (await D.playerBoard(db, "all", null, NOW)).length === 3);
ok("players today", (await D.playersToday(db, NOW)) === 3);

// teams
ok("bad team name", isErr(await D.createTeam(db, alice.id, "x", "school"), 400));
ok("bad team kind", isErr(await D.createTeam(db, alice.id, "Zed", "club"), 400));
const solo = await D.createTeam(db, alice.id, "Solo Stars", "crew");
const trio = await D.createTeam(db, bob.id, "Trio High", "school");
if (isErr(solo) || isErr(trio)) throw new Error("team create failed");
ok("duplicate team name rejected", isErr(await D.createTeam(db, carol.id, "solo stars", "crew"), 409));
ok("join team", !isErr(await D.joinTeam(db, carol.id, trio.id)));
ok("joining twice is harmless", !isErr(await D.joinTeam(db, carol.id, trio.id)));
ok("unknown team", isErr(await D.joinTeam(db, carol.id, "00000000-0000-0000-0000-000000000000"), 404));
ok("malformed team id", isErr(await D.joinTeam(db, carol.id, "'; drop table teams;--"), 400));
const list = await D.listTeams(db, carol.id);
ok("team list shows members and my membership", list.find((x) => x.name === "Trio High")?.members === 2 && list.find((x) => x.name === "Trio High")?.joined === true && list.find((x) => x.name === "Solo Stars")?.joined === false, list);
const tb = await D.teamBoard(db, "daily", NOW);
// Solo = alice 3000; Trio = bob 4200 + carol 1500 => avg 2850. Average, so size gives no edge.
ok("team board ranks by average", tb[0].name === "Solo Stars" && tb[0].avg_points === 3000 && tb[1].avg_points === 2850 && tb[1].players === 2, tb);
ok("leave team", !isErr(await D.joinTeam(db, carol.id, trio.id, true)) && (await D.listTeams(db, carol.id)).find((x) => x.name === "Trio High")?.members === 1);
for (let i = 0; i < 4; i++) await D.createTeam(db, alice.id, `Extra ${i}`, "crew");
ok("max 5 teams per player", isErr(await D.createTeam(db, alice.id, "One too many", "crew"), 409));

console.log(fail ? `${fail} FAILED` : "Data layer OK");
process.exit(fail ? 1 : 0);
