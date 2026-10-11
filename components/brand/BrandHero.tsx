import Link from "next/link";
import Image from "next/image";
import type { BrandDetail, Section } from "@/lib/cms/types";
import { readableOn } from "@/lib/color";
import { CmsText } from "@/components/ui/CmsText";
import { ButtonLink } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { OwnershipLabel } from "./OwnershipLabel";
import styles from "./BrandHero.module.css";

export function BrandHero({ brand, hasStores, section }: { brand: BrandDetail; hasStores: boolean; section?: Section }) {
  const lightText = readableOn(brand.colors.primary) !== "#16110D";
  const visual = brand.heroVideo ?? brand.hero;
  const logo = brand.logoReverse ?? brand.logo;

  return (
    <section className={styles.hero} aria-labelledby="brand-title" data-header-theme={lightText ? "light" : undefined}>
      <div className={styles.inner}>
        <Reveal variant="fade" className={styles.meta}>
          <Link href="/brands" className={styles.back}>
            <Icon name="arrow" size={16} style={{ transform: "rotate(180deg)" }} /> All brands
          </Link>
          <div className={styles.tags}>
            {brand.category && <span className={styles.category}>{brand.category}</span>}
            <OwnershipLabel ownership={brand.ownership} />
          </div>
        </Reveal>

        <h1 id="brand-title" className={styles.name} data-reveal="up">
          {logo ? (
            <>
              <span className="sr-only">{brand.name}</span>
              <Image src={logo.url} alt="" width={logo.width ?? 800} height={logo.height ?? 300} className={styles.logo} preload unoptimized={logo.mimeType === "image/svg+xml"} />
            </>
          ) : (
            brand.name
          )}
        </h1>

        <div className={styles.foot}>
          <Reveal index={2}>
            <CmsText as="p" value={brand.tagline} className={styles.tagline} />
          </Reveal>
          <Reveal index={3} className={styles.ctas}>
            {section?.cta && (
              <ButtonLink href={section.cta.href} tone="paper" size="lg">
                {section.cta.label}
              </ButtonLink>
            )}
            {section?.cta2 && (hasStores || section.cta2.href !== "#stores") && (
              <ButtonLink href={section.cta2.href} variant="outline" tone="paper" size="lg" icon="pin">
                {section.cta2.label}
              </ButtonLink>
            )}
            {brand.features.investment && (
              <ButtonLink href="#invest" variant="link" icon="arrow-down">
                Own one
              </ButtonLink>
            )}
          </Reveal>
        </div>
      </div>

      <div className={styles.visual}>
        <Media media={visual} sizes="100vw" preload quality={85} hint={`${brand.name} hero (16:9)`} tone="brand" reveal />
      </div>
    </section>
  );
}
