import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function Page() {
  return (
    <div className="prose">
      <h1>Privacy</h1>
      <p className="lede">Grrand Quiz collects nothing about you unless you choose to make an account.</p>
      <h2>On your device</h2>
      <p>Your stats, streak and the questions you have seen are stored in your browser’s local storage. You can erase them any time from the Me tab.</p>
      <h2>On our servers</h2>
      <p>Each question you answer is checked by our server, which receives a signed round token and your chosen option. We don’t store it, and it isn’t linked to you unless you are signed in and finish the round, when we save the final score.</p>
      <h2>If you make an account</h2>
      <p>Accounts are optional. If you make one, we store your username, a scrambled (hashed) version of your 6-digit PIN, the city you pick (if you pick one), the score and date of each round you finish while signed in, and the teams you join. Your username, city and scores appear on the public boards. Choose a username that does not reveal who you are.</p>
      <p>We don’t ask for an email or phone number, so we can’t reset a forgotten PIN. A sign-in cookie keeps you signed in for 30 days and is removed when you sign out.</p>
      <p>Playing without an account stores nothing about you on our servers.</p>
    </div>
  );
}
