import { ImageResponse } from "next/og";
import { CATEGORIES } from "@/lib/bank";
import { readCard } from "@/lib/round";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 1200x630 score card for link previews. The numbers come from a server-signed token, so a
// card can only show a result that was really played.
export async function GET(_req: Request, { params }: { params: Promise<{ card: string }> }) {
  const { card } = await params;
  const c = readCard(decodeURIComponent(card));
  const title = !c ? "Grrand Quiz" : c.m === "daily" ? `Daily round · ${c.d}` : CATEGORIES.find((x) => x.id === c.c)?.name ?? "Round";
  const cells = (c?.g ?? "").split("");
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, background: "#2D1B5E", color: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 40, fontWeight: 800 }}>
          <svg width="64" height="64" viewBox="0 0 32 32">
            <rect x="2" y="6" width="19" height="19" rx="6" fill="#D9D0F2" />
            <rect x="11" y="2" width="19" height="19" rx="6" fill="#C1294A" />
            <path d="M17 11.5l3.2 3.2 5.3-6" stroke="#fff" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Grrand Quiz
        </div>
        {c ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", fontSize: 34, color: "#D9D0F2" }}>{title}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
              <div style={{ display: "flex", fontSize: 200, fontWeight: 800, lineHeight: 1 }}>{c.ok}/{c.n}</div>
              <div style={{ display: "flex", fontSize: 56, fontWeight: 700, color: "#D9D0F2" }}>{c.p.toLocaleString("en-US")} pts</div>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              {cells.map((x, i) => (
                <div key={i} style={{ display: "flex", width: 72, height: 72, borderRadius: 16, background: x === "1" ? "#0B6B3A" : "#7B5EA7", alignItems: "center", justifyContent: "center" }}>
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    {x === "1" ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <path d="M6 12h12" />}
                  </svg>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", fontSize: 88, fontWeight: 800, lineHeight: 1.1 }}>Five questions. Twenty seconds each.</div>
        )}
        <div style={{ display: "flex", fontSize: 32, color: "#D9D0F2" }}>Can you beat it? Play free at grrand-quiz.vercel.app</div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=3600, immutable" } },
  );
}
