"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Flame, Mark, Me, Play, Team, Trophy } from "./Icons";
import { load, streak } from "@/lib/local";
import { CREDIT } from "@/lib/config";

const TABS = [
  { href: "/", label: "Play", Icon: Play },
  { href: "/ranks", label: "Ranks", Icon: Trophy },
  { href: "/teams", label: "Teams", Icon: Team },
  { href: "/me", label: "Me", Icon: Me },
] as const;

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname() || "/";
  const [days, setDays] = useState(0);
  useEffect(() => { setDays(streak(load())); }, [path]);

  // A round owns the whole screen: no tabs, no footer, nothing to tap by accident.
  if (path.startsWith("/play")) {
    return (
      <>
        <a className="skip" href="#main">Skip to question</a>
        <main id="main">{children}</main>
      </>
    );
  }

  return (
    <div className="shell">
      <a className="skip" href="#main">Skip to content</a>
      <header className="topbar">
        <Link href="/" className="brand" aria-label="Grrand Quiz, home">
          <Mark /> Grrand Quiz
        </Link>
        <Link href="/me" className="streak" data-live={days > 0} aria-label={days > 0 ? `${days} day streak` : "No streak yet"}>
          <Flame /> {days}
        </Link>
      </header>
      <main id="main" className="main">{children}</main>
      <nav className="tabbar" aria-label="Main">
        {TABS.map(({ href, label, Icon }) => {
          const on = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link key={href} href={href} className="tab" aria-current={on ? "page" : undefined}>
              <Icon /> {label}
            </Link>
          );
        })}
      </nav>
      <footer className="footer">
        <p className="credit">
          Crafted, conceptualized and designed by <strong>{CREDIT.name}</strong>, {CREDIT.title}. {CREDIT.role}.
        </p>
        <nav aria-label="About">
          <Link href="/about">About</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
      </footer>
    </div>
  );
}
