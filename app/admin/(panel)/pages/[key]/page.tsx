import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminDb } from "@/lib/admin/data";
import { loadBuilderSections } from "@/lib/admin/pages";
import { PAGE_PATHS } from "@/lib/sections/kinds";
import { PageBuilder } from "@/components/admin/builder/PageBuilder";

export async function generateMetadata({ params }: PageProps<"/admin/pages/[key]">): Promise<Metadata> {
  const { key } = await params;
  return { title: `Edit ${key}` };
}

export default async function PageBuilderRoute({ params }: PageProps<"/admin/pages/[key]">) {
  const { key } = await params;
  const db = await adminDb();
  const { data: page } = await db.from("pages").select("key, name").eq("key", key).maybeSingle();
  if (!page) notFound();

  const { sections, thumbs } = await loadBuilderSections(key);

  // Brand pages share one layout — let editors preview it with any brand.
  let previewPaths = [{ label: page.name as string, path: PAGE_PATHS[key] ?? "/" }];
  if (key === "brand-template") {
    const { data: brands } = await db.from("brands").select("name, slug").order("sort_order");
    previewPaths = ((brands ?? []) as { name: string; slug: string }[]).map((b) => ({ label: `Preview: ${b.name}`, path: `/brands/${b.slug}` }));
  }

  return <PageBuilder pageKey={key} pageName={page.name as string} previewPaths={previewPaths} initialSections={sections} initialThumbs={thumbs} />;
}
