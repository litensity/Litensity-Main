import { getBrands } from "@/lib/cms/brands";
import { getStores } from "@/lib/cms/stores";
import { getPeople } from "@/lib/cms/people";
import { HomeHero, type HomeHeroLayout } from "@/components/home/HomeHero";
import { HouseOfBrands } from "@/components/home/HouseOfBrands";
import { FootprintPreview } from "@/components/home/FootprintPreview";
import { FoundersPreview } from "@/components/home/FoundersPreview";
import type { SectionProps } from "./generic";

/* Home-page blocks: thin data loaders around the designed home components. */

export async function HomeHeroSection({ section, nextKey }: SectionProps) {
  const layout: HomeHeroLayout = section.layout === "3d" || section.layout === "classic" ? section.layout : "panels";
  return <HomeHero section={section} brands={await getBrands()} nextHref={nextKey ? `#${nextKey}` : undefined} layout={layout} />;
}

export async function HouseOfBrandsSection({ section }: SectionProps) {
  const [brands, stores] = await Promise.all([getBrands(), getStores()]);
  return <HouseOfBrands section={section} brands={brands} stores={stores} />;
}

export async function FootprintSection({ section }: SectionProps) {
  const [brands, stores] = await Promise.all([getBrands(), getStores()]);
  return <FootprintPreview section={section} stores={stores} brands={brands} />;
}

export async function FoundersPreviewSection({ section }: SectionProps) {
  return <FoundersPreview section={section} founders={await getPeople("founder")} />;
}
