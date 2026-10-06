import { json, withDb, currentUser } from "@/lib/api";
import { dbEnabled } from "@/lib/db";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  if (!dbEnabled()) return json({ enabled: false, user: null });
  return withDb(async (db) => {
    const u = await currentUser(db);
    return json({ enabled: true, user: u ? { username: u.username, city: u.city } : null });
  });
}
