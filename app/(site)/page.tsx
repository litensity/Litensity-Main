import type { Metadata } from "next";
import { getSections } from "@/lib/cms/site";
import { buildMetadata } from "@/lib/seo";
import { PageSections } from "@/components/sections/PageSections";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const sections = await getSections("home");
  return buildMetadata("home", {
    title: sections.hero?.heading?.replace(/\*/g, "").replace(/\n/g, " ") ?? "Litensity",
    description: sections.hero?.body,
    path: "/",
    image: sections.hero?.media,
  });
}

export default function HomePage() {
  return <PageSections pageKey="home" />;
}
