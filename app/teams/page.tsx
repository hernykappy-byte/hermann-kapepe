import type { Metadata } from "next";
import TeamsView from "@/components/TeamsView";

export const metadata: Metadata = { title: "Teams" };

export default function Page() {
  return (
    <>
      <h1>Teams</h1>
      <p className="lede">Play for your school, class or crew. A team’s score is the average of its members, so a big team has no edge over a small one.</p>
      <TeamsView />
    </>
  );
}
