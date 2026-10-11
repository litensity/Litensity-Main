import type { BrandSummary, Section, Store } from "@/lib/cms/types";
import { footprintOf } from "@/lib/cms/stores";
import { Container, Eyebrow, Section as Band } from "@/components/ui/Layout";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { CmsText } from "@/components/ui/CmsText";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { IndiaDotMap } from "@/components/stores/IndiaDotMap";
import { FootprintExplorer, type FootprintBrand } from "./FootprintExplorer";
import styles from "./FootprintPreview.module.css";

export function FootprintPreview({ section, stores, brands }: { section: Section | undefined; stores: Store[]; brands: BrandSummary[] }) {
  if (!section) return null;
  const fp = footprintOf(stores);
  const perBrand: FootprintBrand[] = brands.map((b) => {
    const f = footprintOf(stores.filter((s) => s.brand.id === b.id));
    return { slug: b.slug, name: b.name, color: b.colors.primary, stores: f.storesLive, cities: f.cities, states: f.states };
  });
  const label = "Map of India showing Litensity store locations";

  return (
    <Band tone="cream" labelledBy="footprint-title" className={styles.band}>
      <Container className={styles.grid}>
        <div className={styles.text}>
          <Eyebrow index={3}>{section.eyebrow}</Eyebrow>
          <SplitHeading id="footprint-title" text={section.heading} className={styles.heading} />
          <Reveal index={2}>
            <CmsText as="p" value={section.body} className={styles.body} />
          </Reveal>
        </div>

        <FootprintExplorer
          brands={perBrand}
          total={{ stores: fp.storesLive, cities: fp.cities, states: fp.states }}
          mapLabel={label}
          map={<IndiaDotMap stores={stores} label={label} linked />}
        />

        {section.cta && (
          <div className={styles.cta}>
            <ButtonLink href={section.cta.href} icon="pin">
              {section.cta.label}
            </ButtonLink>
          </div>
        )}
      </Container>
    </Band>
  );
}
