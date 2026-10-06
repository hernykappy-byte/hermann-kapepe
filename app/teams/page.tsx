import type { Metadata } from "next";

export const metadata: Metadata = { title: "Teams" };

export default function Page() {
  return (
    <>
      <h1>Teams</h1>
      <p className="lede">Play for your school, class or crew. A team’s score is the average of its members, so a big team has no edge over a small one.</p>
      <div className="empty">
        <p><span className="status">Planned</span></p>
        <h2 style={{ marginBlockEnd: "var(--s2)" }}>Not live yet</h2>
        <p style={{ marginBlockEnd: 0 }}>Teams arrive with accounts. Nothing is listed here until real teams exist.</p>
      </div>
    </>
  );
}
