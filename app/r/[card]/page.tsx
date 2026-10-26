import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES } from "@/lib/bank";
import { readCard } from "@/lib/round";
import { SITE } from "@/lib/config";

export const dynamic = "force-dynamic";

type P = { params: Promise<{ card: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { card } = await params;
  const c = readCard(decodeURIComponent(card));
  const title = c ? `${c.ok} of ${c.n} on Grrand Quiz` : SITE.name;
  const desc = c ? `${c.p.toLocaleString("en-US")} points. Can you beat it?` : SITE.description;
  const img = `${SITE.url}/r/${card}/image`;
  return {
    title,
    description: desc,
    robots: { index: false },
    openGraph: { title, description: desc, type: "website", siteName: SITE.name, images: [{ url: img, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description: desc, images: [img] },
  };
}

export default async function Page({ params }: P) {
  const { card } = await params;
  const c = readCard(decodeURIComponent(card));
  const what = !c ? null : c.m === "daily" ? `the daily round for ${c.d}` : `the ${CATEGORIES.find((x) => x.id === c.c)?.name ?? ""} category`;
  return (
    <>
      <h1>{c ? `${c.ok} of ${c.n} correct` : "Grrand Quiz"}</h1>
      <p className="lede">{c ? `A friend scored ${c.p.toLocaleString("en-US")} points in ${what}. Think you can beat it?` : "This result link isn't valid, but the game is."}</p>
      {c && (
        <div className="grid-result" role="img" aria-label={c.g.split("").map((x, k) => `Question ${k + 1} ${x === "1" ? "correct" : "missed"}`).join(", ")}>
          {c.g.split("").map((x, k) => <span key={k} className={`cell ${x === "1" ? "hit" : "miss"}`} />)}
        </div>
      )}
      <p><Link className="btn" href={c?.m === "category" && c.c ? `/play/${c.c}` : "/play/daily"}>{c?.m === "category" ? "Play this category" : "Play today’s round"}</Link></p>
    </>
  );
}
