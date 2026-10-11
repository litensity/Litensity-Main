import type { Metadata } from "next";
import { getSections } from "@/lib/cms/site";
import { buildMetadata } from "@/lib/seo";
import { PageSections } from "@/components/sections/PageSections";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSections("brands");
  return buildMetadata("brands", { title: "Our Brands", description: s.intro?.body, path: "/brands", image: s.intro?.media });
}

export default function Page() {
  return <PageSections pageKey="brands" />;
}
