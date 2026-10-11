import type { Enums } from "@/types/database";
import type { MediaAsset } from "./media";

/* Domain models rendered by the public site. Components never see raw rows. */

export interface CtaLink {
  label: string;
  href: string;
}

export interface Section {
  key: string;
  eyebrow: string | null;
  heading: string | null;
  subheading: string | null;
  body: string | null;
  cta: CtaLink | null;
  cta2: CtaLink | null;
  media: MediaAsset | null;
  video: MediaAsset | null;
}

export type SectionMap = Record<string, Section | undefined>;

export interface ContentItem {
  id: string;
  title: string;
  body: string | null;
  meta: string | null;
  icon: string | null;
  href: string | null;
  media: MediaAsset | null;
}

export interface StatItem {
  id: string;
  label: string;
  /** Null when not yet supplied/confirmed — never rendered publicly. */
  value: string | null;
  suffix: string | null;
  note: string | null;
}

export interface SiteSettings {
  companyName: string;
  legalName: string;
  positioningLine: string | null;
  address: string | null;
  mapUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  whatsappNumber: string | null;
  whatsappMessage: string | null;
  enquire: CtaLink;
  footerStatement: string | null;
  newsletterEnabled: boolean;
  newsletterHeading: string | null;
  analyticsId: string | null;
  logo: MediaAsset | null;
  defaultOgImage: MediaAsset | null;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface Navigation {
  header: NavItem[];
  footerExplore: NavItem[];
  footerLegal: NavItem[];
}

export interface SocialLink {
  platform: string;
  url: string;
  brandId: string | null;
}

export interface BrandSummary {
  id: string;
  slug: string;
  name: string;
  ownership: Enums<"brand_ownership">;
  tagline: string | null;
  positioning: string | null;
  category: string | null;
  formatSummary: string | null;
  ticketSizeLabel: string | null;
  colors: { primary: string; ink: string; surface: string };
  typeface: Enums<"typeface_preset">;
  /** Procedural 3D object shown in heroes ("none" = no 3D). */
  heroObject: "none" | "chicken" | "waffle" | "donut";
  logo: MediaAsset | null;
  /** Logo variant for the brand's primary colour (hero); null = use `logo`. */
  logoReverse: MediaAsset | null;
  card: MediaAsset | null;
  hero: MediaAsset | null;
  features: BrandFeatures;
}

export interface BrandFeatures {
  menuDownload: boolean;
  brochureDownload: boolean;
  investment: boolean;
  investmentEnquiry: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string | null;
  media: MediaAsset | null;
  products: Product[];
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  priceLabel: string | null;
  isBestseller: boolean;
  isVeg: boolean | null;
  media: MediaAsset | null;
}

export interface Campaign {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  media: MediaAsset | null;
  cta: CtaLink | null;
}

export interface GalleryItem {
  id: string;
  media: MediaAsset;
  caption: string | null;
  tag: string | null;
}

export interface DeliveryLink {
  platform: string;
  url: string;
}

export interface DownloadOffer {
  id: string;
  kind: Enums<"download_kind">;
  title: string;
  description: string | null;
  requiresOtp: boolean;
}

export interface InvestmentModel {
  id: string;
  name: string;
  format: string | null;
  description: string | null;
  includes: string[];
  /** Commercial figures — present only when `figures_confirmed` is true. */
  figures: {
    investmentRange: string | null;
    areaRequirement: string | null;
    paybackRange: string | null;
    returnRange: string | null;
    assumptions: string | null;
  } | null;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export interface BrandDetail extends BrandSummary {
  storyHeading: string | null;
  storyBody: string | null;
  differentiation: string | null;
  heroVideo: MediaAsset | null;
  externalUrl: string | null;
  investment: {
    heading: string | null;
    intro: string | null;
    field: Enums<"investment_field">;
    formatOptions: string[];
  };
}

export interface StoreHours {
  day: number;
  opensAt: string | null;
  closesAt: string | null;
  isClosed: boolean;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  locality: string | null;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  phone: string;
  status: Enums<"store_status">;
  hoursNote: string | null;
  hours: StoreHours[];
  orderLinks: DeliveryLink[];
  photo: MediaAsset | null;
  brand: { id: string; slug: string; name: string; color: string };
}

export interface Person {
  id: string;
  kind: Enums<"person_kind">;
  name: string;
  designation: string | null;
  background: string | null;
  responsibility: string | null;
  bio: string | null;
  linkedinUrl: string | null;
  photo: MediaAsset | null;
}

export interface Milestone {
  id: string;
  yearLabel: string;
  title: string;
  body: string | null;
  media: MediaAsset | null;
}

export interface CsrInitiative {
  id: string;
  title: string;
  location: string | null;
  eventDate: string | null;
  description: string | null;
  photos: GalleryItem[];
}

export interface Job {
  id: string;
  title: string;
  brandName: string | null;
  brandSlug: string | null;
  location: string;
  employmentType: string;
  summary: string | null;
  description: string | null;
  requirements: string | null;
}

export interface ContactDepartment {
  id: string;
  name: string;
  description: string | null;
  email: string | null;
  phone: string | null;
}

export interface LegalDocument {
  slug: string;
  title: string;
  body: string;
  updatedAt: string;
}

export interface SeoEntry {
  title: string | null;
  description: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: MediaAsset | null;
  canonicalPath: string | null;
  noindex: boolean;
}

export interface FormOptions {
  budgetOptions: string[];
  timelineOptions: string[];
  ticketSizeOptions: string[];
  enquiryTypes: string[];
  successMessage: string | null;
  enabled: boolean;
  consentLabel: string | null;
}
