import { json, readBody, withDb, startSession } from "@/lib/api";
import { register } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const b = await readBody(req);
  if (!b) return json({ error: "Invalid request." }, 400);
  return withDb(async (db) => {
    const r = await register(db, b.username, b.pin, b.city);
    if ("error" in r) return json({ error: r.error }, r.status);
    await startSession(r.id);
    return json({ user: { username: r.username, city: r.city } });
  });
}
