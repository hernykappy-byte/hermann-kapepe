import { json, withDb } from "@/lib/api";
import { playerBoard, teamBoard, type Window } from "@/lib/data";
import { CITIES } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const w = (["daily", "weekly", "all"].includes(q.get("w") || "") ? q.get("w") : "daily") as Window;
  const c = q.get("city");
  const city = c && (CITIES as readonly string[]).includes(c) ? c : null;
  return withDb(async (db) => {
    const [players, teams] = await Promise.all([playerBoard(db, w, city), teamBoard(db, w)]);
    return json({ enabled: true, window: w, city, players, teams });
  });
}
