import type { Metadata } from "next";
import Script from "next/script";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { EnquireDock } from "@/components/layout/EnquireDock";
import { MagneticField } from "@/components/ui/MagneticField";
import { getSiteSettings } from "@/lib/cms/site";
import { present } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const name = present(settings.companyName) ?? "Litensity";
  return {
    title: { default: name, template: `%s · ${name}` },
    applicationName: name,
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const gaId = settings.analyticsId && /^G-[A-Z0-9]+$/.test(settings.analyticsId) ? settings.analyticsId : null;

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <EnquireDock />
      <MagneticField />
      {gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}');`}
          </Script>
        </>
      )}
    </>
  );
}
