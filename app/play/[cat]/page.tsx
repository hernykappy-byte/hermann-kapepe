import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RoundPlayer from "@/components/RoundPlayer";
import { CATEGORIES } from "@/lib/bank";

export const dynamicParams = false;
export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ cat: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ cat: string }> }): Promise<Metadata> {
  const { cat } = await params;
  const c = CATEGORIES.find((x) => x.id === cat);
  return { title: c ? c.name : "Round" };
}

export default async function Page({ params }: { params: Promise<{ cat: string }> }) {
  const { cat } = await params;
  const c = CATEGORIES.find((x) => x.id === cat);
  if (!c) notFound();
  return <RoundPlayer mode="category" category={c.id} cats={CATEGORIES.map((x) => ({ id: x.id, name: x.name }))} />;
}
