import { json, readBody, withDb, currentUser } from "@/lib/api";
import { recordResult } from "@/lib/data";
import { verifyFinished } from "@/lib/round";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The score is read from the server-signed round token. The browser never reports one.
export async function POST(req: Request) {
  const b = await readBody(req);
  if (!b) return json({ error: "Invalid request." }, 400);
  const v = verifyFinished(b.token);
  if ("error" in v) return json({ error: v.error }, v.status);
  return withDb(async (db) => {
    const me = await currentUser(db);
    if (!me) return json({ error: "Sign in to save ranked scores." }, 401);
    const r = await recordResult(db, me.id, v.res, v.rid, v.at);
    if ("error" in r) return json({ error: r.error }, r.status);
    return json(r);
  });
}
