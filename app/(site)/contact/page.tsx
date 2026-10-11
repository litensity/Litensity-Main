import type { Metadata } from "next";
import { getSections } from "@/lib/cms/site";
import { buildMetadata } from "@/lib/seo";
import { PageSections } from "@/components/sections/PageSections";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSections("contact");
  return buildMetadata("contact", { title: "Contact", description: s.hero?.body, path: "/contact", image: s.hero?.media });
}

export default function Page() {
  return <PageSections pageKey="contact" />;
}
