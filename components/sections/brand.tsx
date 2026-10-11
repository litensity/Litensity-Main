import { getKind } from "@/lib/sections/kinds";
import type { ReactNode } from "react";
import type { BrandDetail } from "@/lib/cms/types";
import type { PageSection } from "@/lib/cms/sections";
import {
  getBrandCampaigns,
  getBrandDownloads,
  getBrandMenu,
  getBrands,
  getDeliveryLinks,
  getFaqs,
  getGallery,
  getInvestmentModels,
} from "@/lib/cms/brands";
import { getContentList } from "@/lib/cms/site";
import { getBrandStats, getStoresForBrand } from "@/lib/cms/stores";
import { present } from "@/lib/content";
import { Container, Section as Band } from "@/components/ui/Layout";
import { SectionHead } from "@/components/ui/SectionHead";
import { ButtonLink } from "@/components/ui/Button";
import { Gallery } from "@/components/ui/Gallery";
import { BrandHero } from "@/components/brand/BrandHero";
import { BrandNav } from "@/components/brand/BrandNav";
import { BrandCampaigns, BrandDownloads, BrandHighlights, BrandMenu, BrandOrder, BrandStory } from "@/components/brand/BrandBlocks";
import { BrandEnquiry, InvestFaq, InvestIntro, InvestProcess, InvestSupport } from "@/components/brand/BrandInvestment";
import { StoreLocator } from "@/components/stores/StoreLocator";

const NAV_LABELS: Record<string, string> = {
  brand_story: "Story",
  brand_menu: "Menu",
  brand_stores: "Stores",
  brand_order: "Order",
  brand_gallery: "Gallery",
  brand_downloads: "Downloads",
  brand_investment: "Invest",
  brand_enquiry: "Contact",
};

/**
 * Renders a brand page from the shared brand-template sections, in the order set
 * in the admin. Each block also respects the brand's own feature switches.
 */
export async function BrandSections({ brand, sections }: { brand: BrandDetail; sections: PageSection[] }) {
  const invest = brand.features.investment;
  const [menu, campaigns, gallery, deliveryLinks, downloads, stats, stores, allBrands, pillars, models, support, process, faqs] = await Promise.all([
    getBrandMenu(brand.id),
    getBrandCampaigns(brand.id),
    getGallery("brand", brand.id),
    getDeliveryLinks(brand.id),
    getBrandDownloads(brand.id, brand.features),
    getBrandStats(brand.id),
    getStoresForBrand(brand.id),
    getBrands(),
    getContentList("brand.pillars", brand.id),
    invest ? getInvestmentModels(brand.id) : Promise.resolve([]),
    invest ? getContentList("brand.support", brand.id) : Promise.resolve([]),
    invest ? getContentList("brand.process", brand.id) : Promise.resolve([]),
    invest ? getFaqs("brand_investment", brand.id) : Promise.resolve([]),
  ]);
  const menuDownload = downloads.find((d) => d.kind === "menu");
  const brochure = downloads.find((d) => d.kind === "brochure");
  const hasStores = stores.length > 0;

  const render = (s: PageSection): ReactNode => {
    switch (s.kind) {
      case "brand_hero":
        return <BrandHero brand={brand} hasStores={hasStores} section={s} />;
      case "brand_story":
        return <BrandStory brand={brand} label={s} pillars={pillars} />;
      case "brand_highlights":
        return <BrandHighlights label={s} stats={stats} />;
      case "brand_menu":
        return <BrandMenu brand={brand} label={s} menu={menu} menuDownload={menuDownload} />;
      case "brand_campaigns":
        return <BrandCampaigns label={s} campaigns={campaigns} />;
      case "brand_stores":
        return hasStores ? (
          <Band tone="cream" labelledBy="stores-title">
            <Container>
              <SectionHead
                id="stores-title"
                eyebrow={s.eyebrow}
                heading={s.heading}
                actions={
                  s.cta && (
                    <ButtonLink href={`${s.cta.href}?brand=${brand.slug}`} variant="outline">
                      {s.cta.label}
                    </ButtonLink>
                  )
                }
              />
              <StoreLocator
                stores={stores}
                brands={allBrands.map((b) => ({ slug: b.slug, name: b.name, color: b.colors.primary }))}
                initialBrand={brand.slug}
                lockBrand
              />
            </Container>
          </Band>
        ) : null;
      case "brand_order":
        return <BrandOrder label={s} links={deliveryLinks} />;
      case "brand_gallery":
        return gallery.length > 0 ? (
          <Band tone="paper" labelledBy="gallery-title">
            <Container>
              <SectionHead id="gallery-title" eyebrow={s.eyebrow} heading={s.heading} size="md" />
              <Gallery items={gallery} label={`${brand.name} gallery`} />
            </Container>
          </Band>
        ) : null;
      case "brand_downloads":
        return <BrandDownloads brand={brand} label={s} downloads={downloads} />;
      case "brand_investment":
        return <InvestIntro brand={brand} label={s} models={models} brochure={brochure} />;
      case "brand_support":
        return <InvestSupport brand={brand} label={s} items={support} />;
      case "brand_process":
        return <InvestProcess brand={brand} label={s} items={process} />;
      case "brand_faq":
        return <InvestFaq brand={brand} label={s} faqs={faqs} />;
      case "brand_enquiry":
        return <BrandEnquiry brand={brand} label={s} />;
      default:
        return null;
    }
  };

  // Which blocks actually have something to show (drives the sticky nav).
  const shows: Record<string, boolean> = {
    brand_story: Boolean(present(brand.storyHeading) || present(brand.storyBody)),
    brand_menu: menu.length > 0 || Boolean(menuDownload),
    brand_stores: hasStores,
    brand_order: deliveryLinks.length > 0,
    brand_gallery: gallery.length > 0,
    brand_downloads: downloads.length > 0,
    brand_investment: invest,
    brand_support: invest && support.length > 0,
    brand_process: invest && process.length > 0,
    brand_faq: invest && faqs.length > 0,
    brand_highlights: stats.length > 0,
    brand_campaigns: campaigns.length > 0,
    brand_enquiry: true,
  };
  const nav = sections.filter((s) => NAV_LABELS[s.kind] && shows[s.kind]).map((s) => ({ id: s.key, label: NAV_LABELS[s.kind] }));

  const hero = sections.find((s) => s.kind === "brand_hero");
  const rest = sections.filter((s) => s !== hero);

  return (
    <>
      {hero && (
        <div id={hero.key} data-source-section={getKind(hero.kind)?.label ?? hero.kind}>
          {render(hero)}
        </div>
      )}
      <BrandNav items={nav} brandName={brand.name} />
      {rest.map((s) => {
        // Blocks with nothing to show (or switched off for this brand) leave no trace in the HTML.
        if (shows[s.kind] === false) return null;
        const node = render(s);
        return node ? (
          <div key={s.id} id={s.key} data-section={s.kind} data-source-section={getKind(s.kind)?.label ?? s.kind}>
            {node}
          </div>
        ) : null;
      })}
    </>
  );
}
