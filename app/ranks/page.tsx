import type { Metadata } from "next";
import Boards from "@/components/Boards";

export const metadata: Metadata = { title: "Ranks" };

export default function Page() {
  return (
    <>
      <h1>Ranks</h1>
      <p className="lede">Daily, weekly and all-time boards, by player, team and city.</p>
      <Boards />
    </>
  );
}
