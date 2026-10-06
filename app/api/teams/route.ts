import { json, readBody, withDb, currentUser } from "@/lib/api";
import { createTeam, listTeams } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withDb(async (db) => {
    const me = await currentUser(db);
    return json({ enabled: true, signedIn: !!me, teams: await listTeams(db, me?.id ?? null) });
  });
}

export async function POST(req: Request) {
  const b = await readBody(req);
  if (!b) return json({ error: "Invalid request." }, 400);
  return withDb(async (db) => {
    const me = await currentUser(db);
    if (!me) return json({ error: "Sign in to create a team." }, 401);
    const r = await createTeam(db, me.id, b.name, b.kind);
    return "error" in r ? json({ error: r.error }, r.status) : json(r);
  });
}
