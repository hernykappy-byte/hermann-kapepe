import { json, readBody, withDb, currentUser } from "@/lib/api";
import { joinTeam } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const b = await readBody(req);
  if (!b) return json({ error: "Invalid request." }, 400);
  return withDb(async (db) => {
    const me = await currentUser(db);
    if (!me) return json({ error: "Sign in to join a team." }, 401);
    const r = await joinTeam(db, me.id, b.teamId, b.leave === true);
    return "error" in r ? json({ error: r.error }, r.status) : json(r);
  });
}
