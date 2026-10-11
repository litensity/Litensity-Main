import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getResource } from "@/lib/admin/resources";
import { getRecord } from "@/lib/admin/data";
import { RecordEditor } from "@/components/admin/RecordEditor";

export async function generateMetadata({ params }: PageProps<"/admin/r/[resource]/[id]">): Promise<Metadata> {
  const { resource, id } = await params;
  const r = getResource(resource);
  return { title: id === "new" ? `New ${r?.singular.toLowerCase() ?? "record"}` : (r?.singular ?? "Edit") };
}

export default async function ResourceEditPage({ params, searchParams }: PageProps<"/admin/r/[resource]/[id]">) {
  const [{ resource: key, id: rawId }, sp] = await Promise.all([params, searchParams]);
  const resource = getResource(key);
  if (!resource || resource.singleton) notFound();
  const id = decodeURIComponent(rawId);

  if (id === "new") {
    if (resource.canCreate === false || resource.readOnly) notFound();
    return <RecordEditor resource={resource} row={null} id={null} searchParams={sp} />;
  }

  const row = await getRecord(resource, id);
  if (!row) notFound();
  return <RecordEditor resource={resource} row={row} id={id} searchParams={sp} />;
}
