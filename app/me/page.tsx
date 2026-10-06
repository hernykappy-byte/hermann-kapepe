import type { Metadata } from "next";
import Me from "@/components/Me";

export const metadata: Metadata = { title: "Me" };
export default function Page() { return <Me />; }
