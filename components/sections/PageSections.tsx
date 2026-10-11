import { getKind } from "@/lib/sections/kinds";
import type { ReactNode } from "react";
import { getPageSections, type PageSection } from "@/lib/cms/sections";
import {
  CtaBandSection,
  FaqSection,
  ImageBannerSection,
  ImageGallerySection,
  LinkRowsSection,
  PageHeroSection,
  PillarsSection,
  QuoteSection,
  StatementSection,
  StatsSection,
  TextMediaSection,
  TimelineSection,
} from "./generic";
import { FootprintSection, FoundersPreviewSection, HomeHeroSection, HouseOfBrandsSection } from "./home";
import {
  BrandCompareSection,
  BrandInvestLinksSection,
  BrandRowsSection,
  CareerFormSection,
  CareersGallerySection,
  ContactFormSection,
  ContactHqSection,
  CsrFormSection,
  CsrGallerySection,
  CsrInitiativesSection,
  DepartmentsSection,
  InvestorFormSection,
  JobListSection,
  MilestonesSection,
  OwnershipModelSection,
  PeopleSection,
  StoreLocatorSection,
  type PageContext,
} from "./pages";

function renderSection(section: PageSection, index: number | undefined, ctx: PageContext, nextKey?: string): ReactNode {
  const p = { section, index, nextKey };
  switch (section.kind) {
    // generic
    case "page_hero":
      return <PageHeroSection {...p} />;
    case "text_media":
      return <TextMediaSection {...p} />;
    case "statement":
      return <StatementSection {...p} />;
    case "quote":
      return <QuoteSection {...p} />;
    case "cta_band":
      return <CtaBandSection {...p} />;
    case "image_banner":
      return <ImageBannerSection {...p} />;
    case "pillars":
      return <PillarsSection {...p} />;
    case "stats":
      return <StatsSection {...p} />;
    case "timeline":
      return <TimelineSection {...p} />;
    case "faq":
      return <FaqSection {...p} />;
    case "link_rows":
      return <LinkRowsSection {...p} />;
    case "image_gallery":
      return <ImageGallerySection {...p} />;
    // home
    case "home_hero":
      return <HomeHeroSection {...p} />;
    case "house_of_brands":
      return <HouseOfBrandsSection {...p} />;
    case "footprint":
      return <FootprintSection {...p} />;
    case "founders_preview":
      return <FoundersPreviewSection {...p} />;
    // pages
    case "brand_rows":
      return <BrandRowsSection />;
    case "brand_compare":
      return <BrandCompareSection {...p} />;
    case "ownership_model":
      return <OwnershipModelSection {...p} />;
    case "brand_invest_links":
      return <BrandInvestLinksSection {...p} />;
    case "investor_form":
      return <InvestorFormSection {...p} />;
    case "store_locator":
      return <StoreLocatorSection {...p} ctx={ctx} />;
    case "milestones":
      return <MilestonesSection {...p} />;
    case "founders":
      return <PeopleSection {...p} kind="founder" />;
    case "leadership":
      return <PeopleSection {...p} kind="leader" />;
    case "csr_initiatives":
      return <CsrInitiativesSection {...p} />;
    case "csr_gallery":
      return <CsrGallerySection {...p} />;
    case "csr_form":
      return <CsrFormSection {...p} />;
    case "careers_gallery":
      return <CareersGallerySection {...p} />;
    case "job_list":
      return <JobListSection {...p} ctx={ctx} />;
    case "career_form":
      return <CareerFormSection {...p} ctx={ctx} />;
    case "contact_hq":
      return <ContactHqSection {...p} />;
    case "departments":
      return <DepartmentsSection {...p} />;
    case "contact_form":
      return <ContactFormSection {...p} />;
    default:
      return null;
  }
}

/**
 * Renders a page as the ordered list of sections managed in Admin → Pages.
 * Each section is wrapped in an anchor (its key) so links like /invest#enquire work.
 */
export async function PageSections({ pageKey, searchParams = {} }: { pageKey: string; searchParams?: PageContext["searchParams"] }) {
  const sections = await getPageSections(pageKey);
  const ctx = { searchParams };
  return (
    <>
      {sections.map((section, i) => (
        <div key={section.id} id={section.key} data-section={section.kind} data-source-section={getKind(section.kind)?.label ?? section.kind}>
          {renderSection(section, i === 0 ? undefined : i, ctx, sections[i + 1]?.key)}
        </div>
      ))}
    </>
  );
}
