import { getNavigation, getSiteSettings } from "@/lib/cms/site";
import { getBrands } from "@/lib/cms/brands";
import { HeaderBar } from "./HeaderBar";

export async function Header() {
  const [nav, settings, brands] = await Promise.all([getNavigation(), getSiteSettings(), getBrands()]);
  return (
    <HeaderBar
      items={nav.header}
      enquire={settings.enquire}
      companyName={settings.companyName}
      logoUrl={settings.logo?.url ?? null}
      brands={brands.map((b) => ({ slug: b.slug, name: b.name, color: b.colors.primary, tagline: b.category }))}
      contact={{ phone: settings.phone, email: settings.email }}
    />
  );
}
