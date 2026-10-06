import { json, endSession } from "@/lib/api";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST() { await endSession(); return json({ ok: true }); }
