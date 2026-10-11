import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSections } from "@/lib/cms/site";
import { buildMetadata } from "@/lib/seo";
import { PageSections } from "@/components/sections/PageSections";


export async function generateMetadata(): Promise<Metadata> {
  const s = await getSections("careers");
  return buildMetadata("careers", { title: "Careers", description: s.hero?.body, path: "/careers", image: s.hero?.media });
}

export default async function Page({ searchParams }: PageProps<"/careers">) {
  const params = await searchParams;
  // Older "?job=<id>#apply" links now live on the role's own page.
  if (typeof params.job === "string" && /^[0-9a-f-]{36}$/i.test(params.job)) redirect(`/careers/${params.job}`);
  return <PageSections pageKey="careers" searchParams={params} />;
}
