import type { Metadata } from "next";
import RoundPlayer from "@/components/RoundPlayer";
import { CATEGORIES } from "@/lib/bank";

export const metadata: Metadata = { title: "Daily round" };

export default function Page() {
  return <RoundPlayer mode="daily" category={null} cats={CATEGORIES.map((c) => ({ id: c.id, name: c.name }))} />;
}
