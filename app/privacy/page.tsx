import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function Page() {
  return (
    <div className="prose">
      <h1>Privacy</h1>
      <p className="lede">Right now Grrand Quiz collects nothing about you.</p>
      <h2>On your device</h2>
      <p>Your stats, streak and the questions you have seen are stored in your browser’s local storage. You can erase them any time from the Me tab.</p>
      <h2>On our servers</h2>
      <p>Each question you answer is checked by our server, which receives a signed round token and your chosen option. We don’t store it or link it to you.</p>
      <h2>When accounts arrive</h2>
      <p>This page will be updated before any sign-in feature goes live, and will say exactly what is stored.</p>
    </div>
  );
}
