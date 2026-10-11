import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBrandBySlug, getBrands } from "@/lib/cms/brands";
import { getPageSections } from "@/lib/cms/sections";
import { brandVars } from "@/lib/color";
import { present } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { BrandSections } from "@/components/sections/brand";

export const revalidate = 300;

/** Every published brand is prerendered; brands added later in the CMS render on demand. */
export async function generateStaticParams() {
  const brands = await getBrands();
  return brands.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps<"/brands/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return {};
  return buildMetadata(`brand:${brand.slug}`, {
    title: brand.name,
    description: present(brand.positioning) ?? present(brand.tagline),
    path: `/brands/${brand.slug}`,
    image: brand.hero,
  });
}

/**
 * THE brand template. BIGGUYS, Belgian Waffle, DCube — and any future brand —
 * render through this one page. Section order comes from Admin → Pages → Brand pages;
 * each brand's feature switches decide which blocks exist.
 */
export default async function BrandPage({ params }: PageProps<"/brands/[slug]">) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();
  const sections = await getPageSections("brand-template");

  return (
    <div data-typeface={brand.typeface} style={brandVars(brand.colors) as CSSProperties}>
      <BrandSections brand={brand} sections={sections} />
    </div>
  );
}
