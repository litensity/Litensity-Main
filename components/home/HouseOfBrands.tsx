import Link from "next/link";
import type { CSSProperties } from "react";
import type { BrandSummary, Section } from "@/lib/cms/types";
import type { Store } from "@/lib/cms/types";
import { brandVars } from "@/lib/color";
import { Container, Eyebrow } from "@/components/ui/Layout";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { CmsText } from "@/components/ui/CmsText";
import { ButtonLink } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { OwnershipLabel } from "@/components/brand/OwnershipLabel";
import { StackProgress } from "./StackProgress";
import styles from "./HouseOfBrands.module.css";

interface Props {
  section: Section | undefined;
  brands: BrandSummary[];
  stores: Store[];
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Keeps the last two words together ("Desserts Cafe") so long names break into two even lines. */
const keepTail = (name: string) => name.replace(/ (\S+)$/, "\u00A0$1");

/** Brand cards that stack over one another while scrolling; each is fully readable before the next covers it. */
export function HouseOfBrands({ section, brands, stores }: Props) {
  if (!section || brands.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="hob-title">
      <Container className={styles.intro}>
        <Eyebrow index={1}>{section.eyebrow}</Eyebrow>
        <SplitHeading id="hob-title" text={section.heading} className={styles.heading} />
        <div className={styles.introSide}>
          <Reveal index={2}>
            <CmsText as="p" value={section.body} className={styles.body} />
          </Reveal>
          {section.cta && (
            <Reveal index={3}>
              <ButtonLink href={section.cta.href} variant="link">
                {section.cta.label}
              </ButtonLink>
            </Reveal>
          )}
        </div>
      </Container>

      <StackProgress className={styles.stack}>
        {brands.map((brand, i) => {
          const liveCount = stores.filter((s) => s.brand.id === brand.id && s.status === "live").length;
          const cities = new Set(stores.filter((s) => s.brand.id === brand.id && s.status === "live").map((s) => s.city)).size;
          return (
            <li
              key={brand.id}
              className={styles.panel}
              data-typeface={brand.typeface}
              style={{ ...brandVars(brand.colors), "--i": i } as CSSProperties}
            >
              <div className={styles.panelInner}>
                <div className={styles.panelText}>
                  <div className={styles.panelMeta}>
                    <span className={styles.count} aria-label={`Brand ${i + 1} of ${brands.length}`}>
                      <span className={styles.countCurrent}>{pad(i + 1)}</span>
                      <span className={styles.countTrack} aria-hidden="true">
                        {brands.map((b, j) => (
                          <span key={b.id} data-on={j <= i || undefined} />
                        ))}
                      </span>
                      <span className={styles.countTotal}>{pad(brands.length)}</span>
                    </span>
                    <OwnershipLabel ownership={brand.ownership} />
                  </div>

                  <div className={styles.identity}>
                    <h3 className={styles.name} data-long={brand.name.length > 12 || undefined}>
                      <Link href={`/brands/${brand.slug}`}>{brand.name.split(" ").length > 2 ? keepTail(brand.name) : brand.name}</Link>
                    </h3>
                    <CmsText as="p" value={brand.tagline} className={styles.tagline} />
                  </div>

                  <div className={styles.foot}>
                    <dl className={styles.facts}>
                      {brand.category && (
                        <div>
                          <dt>Category</dt>
                          <dd>{brand.category}</dd>
                        </div>
                      )}
                      {liveCount > 0 && (
                        <div>
                          <dt>Stores</dt>
                          <dd>{liveCount}</dd>
                        </div>
                      )}
                      {cities > 0 && (
                        <div>
                          <dt>Cities</dt>
                          <dd>{cities}</dd>
                        </div>
                      )}
                    </dl>
                    <div className={styles.ctas}>
                      <ButtonLink href={`/brands/${brand.slug}`} tone="paper">
                        {`Explore ${brand.name}`}
                      </ButtonLink>
                      <ButtonLink href={`/stores?brand=${brand.slug}`} variant="link" icon="pin">
                        Find a store
                      </ButtonLink>
                    </div>
                  </div>
                </div>
                <Link href={`/brands/${brand.slug}`} className={styles.panelMedia} tabIndex={-1} aria-hidden="true">
                  <Media
                    media={brand.card ?? brand.hero}
                    sizes="(min-width: 900px) 50vw, 100vw"
                    className={styles.mediaFrame}
                    hint={`${brand.name} product photograph (full-bleed, no cut-outs)`}
                    tone="brand"
                  />
                </Link>
              </div>
            </li>
          );
        })}
      </StackProgress>
    </section>
  );
}
