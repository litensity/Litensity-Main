import Link from "next/link";
import type { CSSProperties } from "react";
import type { BrandSummary, Section } from "@/lib/cms/types";
import { brandVars } from "@/lib/color";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { CmsText } from "@/components/ui/CmsText";
import { ButtonLink } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { Marquee } from "@/components/ui/Marquee";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { FoodScene } from "@/components/three/FoodScene";
import styles from "./HomeHero.module.css";

export type HomeHeroLayout = "panels" | "3d" | "classic";

/** Keeps the last two words of a long brand name together ("Desserts Cafe"). */
const keepTail = (name: string) => (name.split(" ").length > 2 ? name.replace(/ (\S+)$/, "\u00A0$1") : name);

interface Props {
  section: Section | undefined;
  brands: BrandSummary[];
  nextHref?: string;
  layout?: HomeHeroLayout;
}

/**
 * Home opening. Default layout: the headline beside one signature-dish panel per brand
 * (each on its brand colour, expanding on hover), then the group film below.
 */
export function HomeHero({ section, brands, nextHref, layout = "panels" }: Props) {
  if (!section) return null;
  const film = section.video ?? section.media;
  const poster = section.video ? section.media : null;
  const objects = brands
    .filter((b) => b.heroObject !== "none")
    .map((b) => ({ type: b.heroObject as "chicken" | "waffle" | "donut", label: b.name, href: `/brands/${b.slug}`, accent: b.colors.primary }));
  const showPanels = layout === "panels" && brands.length > 0;

  return (
    <section className={styles.hero} data-layout={layout} aria-labelledby="home-hero-title">
      <div className={styles.top}>
        <Reveal variant="fade" className={styles.meta}>
          <CmsText as="p" value={section.eyebrow} className="label" />
          {brands.length > 0 && (
            <ul role="list" className={styles.brandDots}>
              {brands.map((b) => (
                <li key={b.id} style={{ "--dot": b.colors.primary } as CSSProperties}>
                  <Link href={`/brands/${b.slug}`}>{b.name}</Link>
                </li>
              ))}
            </ul>
          )}
        </Reveal>

        <div className={styles.stage}>
          <div className={styles.copy}>
            <div className={styles.headline}>
              <SplitHeading as="h1" id="home-hero-title" text={section.heading} className={styles.title} mode="lines" />
              {layout === "3d" && objects.length > 0 && <FoodScene objects={objects} layout="hero" className={styles.scene} />}
            </div>

            <div className={styles.lede}>
              <Reveal index={4}>
                <CmsText as="p" value={section.body} className={styles.body} />
              </Reveal>
              <Reveal index={6} className={styles.ctas}>
                {section.cta && (
                  <ButtonLink href={section.cta.href} size="lg">
                    {section.cta.label}
                  </ButtonLink>
                )}
                {section.cta2 && (
                  <ButtonLink href={section.cta2.href} size="lg" variant="outline">
                    {section.cta2.label}
                  </ButtonLink>
                )}
              </Reveal>
              {nextHref && (
                <a href={nextHref} className={styles.scrollCue} aria-label="Scroll to the next section">
                  <Icon name="arrow-down" size={18} />
                </a>
              )}
            </div>
          </div>

          {showPanels && (
            <ul role="list" className={styles.panels} aria-label="Our brands">
              {brands.map((b, i) => (
                <li
                  key={b.id}
                  className={styles.panelItem}
                  data-typeface={b.typeface}
                  style={{ ...brandVars(b.colors), "--i": i } as CSSProperties}
                >
                  <Link href={`/brands/${b.slug}`} className={styles.panel}>
                    <Media
                      media={b.hero ?? b.card}
                      sizes="(min-width: 1100px) 30vw, 34vw"
                      preload
                      className={styles.panelMedia}
                      hint={`${b.name} signature dish`}
                      tone="brand"
                    />
                    <span className={styles.panelWash} aria-hidden="true" />
                    <span className={styles.panelIndex} aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.panelText}>
                      <span className={styles.panelName} data-long={b.name.split(" ").length > 2 || undefined}>
                        {keepTail(b.name)}
                      </span>
                      <CmsText as="span" value={b.tagline} className={styles.panelTagline} />
                    </span>
                    <span className={styles.panelArrow} aria-hidden="true">
                      <Icon name="arrow-up-right" size={18} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={styles.visualWrap}>
        <Media
          media={film}
          poster={poster}
          sizes="100vw"
          preload={!showPanels}
          quality={85}
          className={styles.visual}
          hint="Group film (6–10s loop) or photograph, 16:9"
          tone="ink"
        />
      </div>

      {brands.length > 0 && (
        <Marquee className={styles.marquee} speed={36} label="Our brands">
          {(hidden) =>
            brands.map((b) => (
              <Link
                key={b.id}
                href={`/brands/${b.slug}`}
                className={styles.marqueeItem}
                data-typeface={b.typeface}
                style={brandVars(b.colors) as CSSProperties}
                tabIndex={hidden ? -1 : undefined}
              >
                {b.name}
                <Icon name="sparkle" size={28} className={styles.marqueeStar} />
              </Link>
            ))
          }
        </Marquee>
      )}
    </section>
  );
}
