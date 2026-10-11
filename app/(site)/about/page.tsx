import type { Metadata } from "next";
import { getSections } from "@/lib/cms/site";
import { buildMetadata } from "@/lib/seo";
import { PageSections } from "@/components/sections/PageSections";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSections("about");
  return buildMetadata("about", { title: "About & Founders", description: s.story?.body, path: "/about", image: s.story?.media });
}

export default function Page() {
  return <PageSections pageKey="about" />;
}
