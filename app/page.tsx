import Home from "@/components/Home";
import { BANK, CATEGORIES } from "@/lib/bank";

export default function Page() {
  // Only ids and counts reach the browser. Answers stay on the server.
  const cats = CATEGORIES.map((c) => ({
    id: c.id,
    name: c.name,
    blurb: c.blurb,
    ids: BANK.filter((q) => q.cat === c.id).map((q) => q.id),
  }));
  return <Home cats={cats} />;
}
