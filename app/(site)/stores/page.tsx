import type { Metadata } from "next";
import { getSections } from "@/lib/cms/site";
import { buildMetadata } from "@/lib/seo";
import { PageSections } from "@/components/sections/PageSections";


export async function generateMetadata(): Promise<Metadata> {
  const s = await getSections("stores");
  return buildMetadata("stores", { title: "Store Locator", description: s.hero?.body, path: "/stores", image: s.hero?.media });
}

export default async function Page({ searchParams }: PageProps<"/stores">) {
  return <PageSections pageKey="stores" searchParams={await searchParams} />;
}
