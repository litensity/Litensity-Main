import Link from "next/link";
import type { CSSProperties } from "react";
import type { PageSection } from "@/lib/cms/sections";
import { paragraphs } from "@/lib/content";
import { Container, Eyebrow, Section as Band, type SectionTone } from "@/components/ui/Layout";
import { SectionHead } from "@/components/ui/SectionHead";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { CmsText } from "@/components/ui/CmsText";
import { ButtonLink } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { PageHero } from "@/components/ui/PageHero";
import { PillarList } from "@/components/ui/PillarList";
import { StatRow, hasVisibleStats } from "@/components/ui/StatRow";
import { Accordion } from "@/components/ui/Accordion";
import { Gallery } from "@/components/ui/Gallery";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import styles from "./generic.module.css";

export interface SectionProps {
  section: PageSection;
  /** Section number shown in eyebrows, e.g. (03). */
  index?: number;
  /** Anchor of the following section (scroll cues). */
  nextKey?: string;
}

const tone = (s: PageSection, fallback: SectionTone = "paper"): SectionTone => (s.tone as SectionTone | null) ?? fallback;
const titleId = (s: PageSection) => `${s.key}-title`;
const dark = (t: SectionTone) => t === "ink" || t === "ember" || t === "brand";

export function PageHeroSection({ section }: SectionProps) {
  const variant = section.layout === "split" || section.layout === "image" ? section.layout : "type";
  // A full-photo hero without a photo falls back to typography so it never looks broken.
  const usable = variant === "image" && !section.media && !section.video ? "type" : variant;
  const t = section.tone === "ink" || section.tone === "ember" ? section.tone : "paper";
  return <PageHero section={section} variant={usable} tone={t} id={titleId(section)} />;
}

export function TextMediaSection({ section, index }: SectionProps) {
  const t = tone(section);
  return (
    <Band tone={t} labelledBy={titleId(section)}>
      <Container>
        <div className={styles.textMedia} data-flip={section.layout === "media-left" || undefined}>
        <div className={styles.textMediaText}>
          <SectionHead id={titleId(section)} index={index} eyebrow={section.eyebrow} heading={section.heading} layout="stack" />
          {paragraphs(section.body).map((p, i) => (
            <Reveal key={i} index={i}>
              <CmsText as="p" value={p} className={i === 0 ? styles.lead : undefined} />
            </Reveal>
          ))}
          {section.cta && (
            <Reveal index={3}>
              <ButtonLink href={section.cta.href} tone={dark(t) ? "paper" : "ink"}>
                {section.cta.label}
              </ButtonLink>
            </Reveal>
          )}
        </div>
        <Media media={section.media} aspect="4 / 5" sizes="(min-width: 900px) 40vw, 100vw" reveal hint="Photograph 4:5" className={styles.arch} />
        </div>
      </Container>
    </Band>
  );
}

export function StatementSection({ section, index }: SectionProps) {
  const t = tone(section);
  return (
    <Band tone={t} labelledBy={titleId(section)}>
      <Container>
        <SectionHead
          id={titleId(section)}
          index={index}
          eyebrow={section.eyebrow}
          heading={section.heading}
          body={section.body}
          actions={
            section.cta && (
              <ButtonLink href={section.cta.href} variant="outline" tone={dark(t) ? "paper" : "ink"}>
                {section.cta.label}
              </ButtonLink>
            )
          }
        />
      </Container>
    </Band>
  );
}

export function QuoteSection({ section }: SectionProps) {
  const t = tone(section, "cream");
  return (
    <Band tone={t} labelledBy={titleId(section)}>
      <Container className={styles.quote}>
        <p className="label">{section.eyebrow}</p>
        <SplitHeading id={titleId(section)} text={section.heading} className={styles.quoteText} />
        <CmsText as="p" value={section.body} className={styles.quoteBody} />
      </Container>
    </Band>
  );
}

export function CtaBandSection({ section, index }: SectionProps) {
  const t = tone(section, "ember");
  return (
    <Band tone={t} labelledBy={titleId(section)}>
      <Container>
        <SectionHead
          id={titleId(section)}
          index={index}
          eyebrow={section.eyebrow}
          heading={section.heading}
          body={section.body}
          actions={
            (section.cta || section.cta2) && (
              <>
                {section.cta && (
                  <ButtonLink href={section.cta.href} tone={t === "ember" ? "ink" : t === "ink" ? "ember" : "ink"} size="lg">
                    {section.cta.label}
                  </ButtonLink>
                )}
                {section.cta2 && (
                  <ButtonLink href={section.cta2.href} variant="outline" tone={dark(t) ? "paper" : "ink"} size="lg">
                    {section.cta2.label}
                  </ButtonLink>
                )}
              </>
            )
          }
        />
      </Container>
    </Band>
  );
}

export function ImageBannerSection({ section, index }: SectionProps) {
  return (
    <section className={styles.banner} aria-labelledby={titleId(section)}>
      <div className={styles.bannerMedia}>
        <Media media={section.media} sizes="100vw" hint="Full-bleed photograph" tone="ink" />
      </div>
      <div className={styles.bannerScrim} />
      <div className={styles.bannerContent}>
        <Eyebrow index={index}>{section.eyebrow}</Eyebrow>
        <SplitHeading id={titleId(section)} text={section.heading} className={styles.bannerHeading} />
        <Reveal index={3} className={styles.bannerFoot}>
          <CmsText as="p" value={section.body} className={styles.bannerBody} />
          {section.cta && (
            <ButtonLink href={section.cta.href} tone="paper" size="lg">
              {section.cta.label}
            </ButtonLink>
          )}
        </Reveal>
      </div>
    </section>
  );
}

export function PillarsSection({ section, index }: SectionProps) {
  const t = tone(section);
  if (section.items.length === 0 && !section.heading) return null;
  if (section.layout === "sticky") {
    return (
      <Band tone={t} labelledBy={titleId(section)}>
        <Container className={styles.sticky}>
          <div className={styles.stickyHead}>
            <Eyebrow index={index}>{section.eyebrow}</Eyebrow>
            <SplitHeading id={titleId(section)} text={section.heading} className={styles.heading} />
            <Reveal index={2}>
              <CmsText as="p" value={section.body} className={styles.body} />
            </Reveal>
            {section.cta && (
              <Reveal index={3}>
                <ButtonLink href={section.cta.href} tone={dark(t) ? "paper" : "ink"}>
                  {section.cta.label}
                </ButtonLink>
              </Reveal>
            )}
          </div>
          <PillarList items={section.items} trackActive />
        </Container>
      </Band>
    );
  }
  const columns = section.layout === "grid-2" ? 2 : 3;
  return (
    <Band tone={t} labelledBy={titleId(section)}>
      <Container>
        <SectionHead
          id={titleId(section)}
          index={index}
          eyebrow={section.eyebrow}
          heading={section.heading}
          body={section.body}
          actions={section.cta && <ButtonLink href={section.cta.href} variant="outline" tone={dark(t) ? "paper" : "ink"}>{section.cta.label}</ButtonLink>}
        />
        <PillarList items={section.items} columns={columns} />
      </Container>
    </Band>
  );
}

export function StatsSection({ section, index }: SectionProps) {
  if (!hasVisibleStats(section.stats)) return null;
  // Up to four figures sit in a 2×2 grid beside the heading; more fall back to a single row.
  const compact = section.stats.length <= 4;
  return (
    <Band tone={tone(section, "ink")} labelledBy={titleId(section)} spacing="tight">
      <Container className={compact ? styles.statsSplit : undefined}>
        <div className={styles.statsHead}>
          <Eyebrow index={index}>{section.eyebrow}</Eyebrow>
          <SplitHeading id={titleId(section)} text={section.heading} className={styles.statsHeading} />
          <CmsText as="p" value={section.body} className={styles.statsBody} />
        </div>
        <StatRow stats={section.stats} layout={compact ? "grid" : "row"} />
      </Container>
    </Band>
  );
}

export function TimelineSection({ section, index }: SectionProps) {
  if (section.items.length === 0) return null;
  return (
    <Band tone={tone(section)} labelledBy={titleId(section)}>
      <Container>
        <SectionHead id={titleId(section)} index={index} eyebrow={section.eyebrow} heading={section.heading} body={section.body} />
        <ol role="list" className={styles.timeline}>
          {section.items.map((item, i) => (
            <li key={item.id} data-reveal="up" style={{ "--i": i } as CSSProperties}>
              <span className={styles.timelineMeta}>{item.meta ?? String(i + 1).padStart(2, "0")}</span>
              <h3 className={styles.timelineTitle}>
                <CmsText value={item.title} />
              </h3>
              <CmsText as="p" value={item.body} className={styles.timelineBody} />
            </li>
          ))}
        </ol>
      </Container>
    </Band>
  );
}

export function FaqSection({ section }: SectionProps) {
  if (section.items.length === 0) return null;
  return (
    <Band tone={tone(section)} labelledBy={titleId(section)} spacing="tight">
      <Container className={styles.faq}>
        <SectionHead id={titleId(section)} eyebrow={section.eyebrow} heading={section.heading} layout="stack" size="md" />
        <Accordion
          name={`faq-${section.key}`}
          items={section.items.map((f) => ({
            id: f.id,
            title: f.title,
            content: paragraphs(f.body).map((p, i) => <CmsText key={i} as="p" value={p} />),
          }))}
        />
      </Container>
    </Band>
  );
}

export function LinkRowsSection({ section, index }: SectionProps) {
  const rows = section.items.filter((i) => i.href);
  if (rows.length === 0) return null;
  return (
    <Band tone={tone(section, "ember")} labelledBy={titleId(section)}>
      <Container>
        <Eyebrow index={index}>{section.eyebrow}</Eyebrow>
        <SplitHeading id={titleId(section)} text={section.heading} className={styles.rowsHeading} />
        <ul role="list" className={styles.rows}>
          {rows.map((p, i) => (
            <li key={p.id} data-reveal="up" style={{ "--i": i } as CSSProperties}>
              <Link href={p.href!} className={styles.row}>
                <span className={styles.rowTitle}>{p.title}</span>
                <CmsText as="span" value={p.body} className={styles.rowBody} />
                <span className={styles.rowArrow} aria-hidden="true">
                  <Icon name="arrow-up-right" size={28} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Band>
  );
}

export function ImageGallerySection({ section, index }: SectionProps) {
  const photos = section.items.flatMap((i) => (i.media ? [{ id: i.id, media: i.media, caption: i.title, tag: null }] : []));
  if (photos.length === 0) return null;
  return (
    <Band tone={tone(section)} labelledBy={titleId(section)}>
      <Container>
        <SectionHead id={titleId(section)} index={index} eyebrow={section.eyebrow} heading={section.heading} size="md" />
        <Gallery items={photos} label={section.heading ?? "Gallery"} />
      </Container>
    </Band>
  );
}
