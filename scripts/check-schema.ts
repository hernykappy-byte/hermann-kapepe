// Applies lib/schema.ts to an in-process Postgres (PGlite) and tests its rules.
import { PGlite } from "@electric-sql/pglite";
import { SCHEMA } from "../lib/schema.ts";

const db = new PGlite();
await db.exec(SCHEMA);
await db.exec(SCHEMA); // must be safe to run on every cold start

let fail = 0;
const ok = (name: string, pass: boolean) => { console.log(`${pass ? "ok  " : "FAIL"} ${name}`); if (!pass) fail++; };
const rejects = async (name: string, sql: string) => { try { await db.exec(sql); ok(name, false); } catch { ok(name, true); } };
ok("schema applies twice", true);

const A = "00000000-0000-0000-0000-00000000000a", B = "00000000-0000-0000-0000-00000000000b";
await db.exec(`insert into profiles(id,username,pin_hash) values ('${A}','alice','x'),('${B}','bob_b','x')`);
await rejects("username too short", `insert into profiles(username,pin_hash) values ('ab','x')`);
await rejects("username has a space", `insert into profiles(username,pin_hash) values ('a b c','x')`);
await rejects("duplicate username, different case", `insert into profiles(username,pin_hash) values ('ALICE','x')`);
const res = (extra: string) => `insert into round_results(round_key,profile_id,mode,${extra}`;
await db.exec(res(`day,correct,total,points) values ('r1','${A}','daily','2026-10-06',4,5,3000)`));
await rejects("second daily same day", res(`day,correct,total,points) values ('r2','${A}','daily','2026-10-06',5,5,4000)`));
await rejects("same round saved twice", res(`category,correct,total,points) values ('r1','${A}','category','zambia',5,5,100)`));
await db.exec(res(`day,correct,total,points) values ('r3','${A}','daily','2026-10-07',3,5,2000)`));
ok("next day accepted", true);
await db.exec(res(`category,correct,total,points) values ('r4','${A}','category','zambia',5,5,3500),('r5','${A}','category','zambia',5,5,3400)`));
ok("category rounds repeatable", true);
await rejects("daily without day", res(`correct,total,points) values ('r6','${B}','daily',1,5,100)`));
await rejects("category with a day", res(`day,correct,total,points) values ('r7','${B}','category','2026-10-06',1,5,100)`));
await rejects("6 correct of 5", res(`day,correct,total,points) values ('r8','${B}','daily','2026-10-06',6,5,100)`));
await rejects("negative points", res(`day,correct,total,points) values ('r9','${B}','daily','2026-10-06',1,5,-5)`));
await db.exec(`insert into teams(name,kind,created_by) values ('Lusaka High','school','${A}')`);
await rejects("duplicate team name, different case", `insert into teams(name,kind,created_by) values ('lusaka high','crew','${B}')`);
await rejects("bad team kind", `insert into teams(name,kind,created_by) values ('Zed','club','${B}')`);

console.log(fail ? `${fail} FAILED` : "Schema OK");
process.exit(fail ? 1 : 0);
