import { nextQuestion } from "@/lib/round";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { token?: unknown };
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const r = nextQuestion(body.token);
  if ("error" in r) return Response.json({ error: r.error }, { status: r.status });
  return Response.json(r, { headers: { "Cache-Control": "no-store" } });
}
