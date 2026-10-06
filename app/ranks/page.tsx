import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Ranks" };

export default function Page() {
  return (
    <>
      <h1>Ranks</h1>
      <p className="lede">Daily, weekly and all-time boards, by school and by city.</p>
      <div className="empty">
        <p><span className="status">Planned</span></p>
        <h2 style={{ marginBlockEnd: "var(--s2)" }}>Not live yet</h2>
        <p>Rankings need accounts so every score is tied to a real player. Until then there is no leaderboard here, and no made-up names to fill it.</p>
        <p style={{ marginBlockEnd: 0 }}>Your own best scores are on <Link href="/me">Me</Link>.</p>
      </div>
    </>
  );
}
