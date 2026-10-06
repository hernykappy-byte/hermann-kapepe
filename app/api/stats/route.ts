import { json, withDb } from "@/lib/api";
import { dbEnabled } from "@/lib/db";
import { playersToday } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!dbEnabled()) return json({ enabled: false });
  return withDb(async (db) => json({ enabled: true, playersToday: await playersToday(db) }));
}
