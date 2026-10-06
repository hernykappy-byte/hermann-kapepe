// Runs supabase/schema.sql on an in-process Postgres (PGlite) and tests its rules.
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";

const db = new PGlite();
// Supabase provides auth.uid(); stub it so the policies can be created here.
await db.exec("create schema auth; create function auth.uid() returns uuid language sql as 'select null::uuid';");
await db.exec(readFileSync(new URL("../supabase/schema.sql", import.meta.url), "utf8"));

let fail = 0;
const ok = (name: string, pass: boolean) => { console.log(`${pass ? "ok  " : "FAIL"} ${name}`); if (!pass) fail++; };
const rejects = async (name: string, sql: string) => { try { await db.exec(sql); ok(name, false); } catch { ok(name, true); } };

const A = "00000000-0000-0000-0000-00000000000a", B = "00000000-0000-0000-0000-00000000000b", C = "00000000-0000-0000-0000-00000000000c";
await db.exec(`insert into profiles(id,username) values ('${A}','alice'),('${B}','bob_b'),('${C}','carol')`);
await rejects("username too short rejected", `insert into profiles(id,username) values (gen_random_uuid(),'ab')`);
await rejects("duplicate username rejected", `insert into profiles(id,username) values (gen_random_uuid(),'alice')`);

await db.exec(`insert into round_results(profile_id,mode,day,correct,total,points) values ('${A}','daily','2026-10-06',4,5,3000)`);
await rejects("second daily result same day rejected", `insert into round_results(profile_id,mode,day,correct,total,points) values ('${A}','daily','2026-10-06',5,5,4000)`);
await db.exec(`insert into round_results(profile_id,mode,day,correct,total,points) values ('${A}','daily','2026-10-07',3,5,2000)`);
ok("same player, next day accepted", true);
await db.exec(`insert into round_results(profile_id,mode,category,correct,total,points) values ('${A}','category','zambia',5,5,3500),('${A}','category','zambia',5,5,3400)`);
ok("category rounds repeatable", true);
await rejects("daily without day rejected", `insert into round_results(profile_id,mode,correct,total,points) values ('${B}','daily',1,5,100)`);
await rejects("category with a day rejected", `insert into round_results(profile_id,mode,day,correct,total,points) values ('${B}','category','2026-10-06',1,5,100)`);
await rejects("6 correct of 5 rejected", `insert into round_results(profile_id,mode,day,correct,total,points) values ('${B}','daily','2026-10-06',6,5,100)`);
await rejects("negative points rejected", `insert into round_results(profile_id,mode,day,correct,total,points) values ('${B}','daily','2026-10-06',1,5,-5)`);

// Team average: a team of 1 strong player vs a team of 3 should compare fairly by average.
await db.exec(`
  insert into teams(id,name,kind,created_by) values
   ('10000000-0000-0000-0000-000000000001','Solo','crew','${A}'),
   ('10000000-0000-0000-0000-000000000002','Trio','school','${B}');
  insert into team_members(team_id,profile_id) values
   ('10000000-0000-0000-0000-000000000001','${A}'),
   ('10000000-0000-0000-0000-000000000002','${B}'),('10000000-0000-0000-0000-000000000002','${C}');
  insert into round_results(profile_id,mode,day,correct,total,points) values ('${B}','daily','2026-10-06',2,5,1000),('${C}','daily','2026-10-06',3,5,2000);`);
const r = await db.query<{ name: string; avg_points: number; players: number }>(`select name,avg_points,players from team_daily_board where day='2026-10-06' order by name`);
const solo = r.rows.find((x) => x.name === "Solo"), trio = r.rows.find((x) => x.name === "Trio");
ok("team board averages members (Solo 3000, Trio 1500)", solo?.avg_points === 3000 && trio?.avg_points === 1500 && trio?.players === 2);
const board = await db.query(`select username from daily_board where day='2026-10-06' order by points desc`);
ok("daily board orders by points", (board.rows[0] as { username: string }).username === "alice");

console.log(fail ? `\n${fail} FAILED` : "\nschema ok");
process.exit(fail ? 1 : 0);
