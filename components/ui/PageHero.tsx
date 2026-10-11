import type { Section } from "@/lib/cms/types";
import { SplitHeading } from "./SplitHeading";
import { CmsText } from "./CmsText";
import { ButtonLink } from "./Button";
import { Media } from "./Media";
import { Reveal } from "./Reveal";
import styles from "./PageHero.module.css";

type Variant = "type" | "split" | "image";

/**
 * Inner-page hero. Variants keep pages visually distinct while sharing one implementation:
 *  - type:  oversized typography only
 *  - split: typography + tall image
 *  - image: full-bleed photograph with light header
 */
export function PageHero({
  section,
  variant = "type",
  tone = "paper",
  hint,
  id = "page-title",
}: {
  section: Section | undefined;
  variant?: Variant;
  tone?: "paper" | "ink" | "ember";
  hint?: string;
  id?: string;
}) {
  if (!section) return null;
  const visual = section.video ?? section.media;
  const light = variant === "image" || tone !== "paper";

  return (
    <section
      className={`${styles.hero} ${styles[variant]} ${styles[tone]}`}
      aria-labelledby={id}
      data-header-theme={light ? "light" : undefined}
    >
      {variant === "image" && (
        <div className={styles.bg}>
          <Media media={visual} sizes="100vw" preload hint={hint} tone="ink" />
          <div className={styles.scrim} />
        </div>
      )}
      <div className={styles.inner}>
        <div className={styles.text}>
          <Reveal variant="fade">
            <CmsText as="p" value={section.eyebrow} className={`label ${styles.eyebrow}`} />
          </Reveal>
          <SplitHeading as="h1" id={id} text={section.heading} className={styles.title} />
          {(section.body || section.cta) && (
            <div className={styles.foot}>
              <Reveal index={4}>
                <CmsText as="p" value={section.body} className={styles.body} />
              </Reveal>
              {(section.cta || section.cta2) && (
                <Reveal index={5} className={styles.ctas}>
                  {section.cta && (
                    <ButtonLink href={section.cta.href} size="lg" tone={light ? "paper" : "ink"}>
                      {section.cta.label}
                    </ButtonLink>
                  )}
                  {section.cta2 && (
                    <ButtonLink href={section.cta2.href} size="lg" variant="outline" tone={light ? "paper" : "ink"}>
                      {section.cta2.label}
                    </ButtonLink>
                  )}
                </Reveal>
              )}
            </div>
          )}
        </div>
        {variant === "split" && (
          <Media media={visual} aspect="4 / 5" sizes="(min-width: 900px) 40vw, 100vw" preload reveal className={styles.splitMedia} hint={hint} />
        )}
      </div>
    </section>
  );
}
