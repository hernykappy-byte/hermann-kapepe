import type { Metadata } from "next";
import { CREDIT } from "@/lib/config";

export const metadata: Metadata = { title: "About" };

export default function Page() {
  return (
    <div className="prose">
      <h1>About Grrand Quiz</h1>
      <p className="lede">A quick, social quiz built in Lusaka. Five questions, twenty seconds each.</p>
      <h2>How a round works</h2>
      <ul>
        <li>Faster correct answers score more, down to half value. There are no streak bonuses.</li>
        <li>A round eases in, peaks on question three, and ends on an easy one.</li>
        <li>The daily round is the same for everyone and resets at midnight Lusaka time.</li>
        <li>The server keeps the answers and the clock, so scores can’t be edited in the browser.</li>
      </ul>
      <h2>What isn’t live yet</h2>
      <ul>
        <li>Accounts, school and city rankings, teams and the live player count.</li>
        <li>Each category has a small question bank for now, so repeats happen. The bank is growing.</li>
      </ul>
      <h2>Who made it</h2>
      <p>Crafted, conceptualized and designed by {CREDIT.name}, {CREDIT.title}.</p>
    </div>
  );
}
