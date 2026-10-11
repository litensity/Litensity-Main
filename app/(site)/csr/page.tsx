import type { Metadata } from "next";
import { getSections } from "@/lib/cms/site";
import { buildMetadata } from "@/lib/seo";
import { PageSections } from "@/components/sections/PageSections";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSections("csr");
  return buildMetadata("csr", { title: "CSR", description: s.hero?.body, path: "/csr", image: s.hero?.media });
}

export default function Page() {
  return <PageSections pageKey="csr" />;
}
