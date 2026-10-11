import type { CSSProperties } from "react";
import type {
  BrandDetail,
  Campaign,
  ContentItem,
  DeliveryLink,
  DownloadOffer,
  ProductCategory,
  Section,
  StatItem,
} from "@/lib/cms/types";
import { paragraphs, present } from "@/lib/content";
import { Container, Section as Band } from "@/components/ui/Layout";
import { SectionHead } from "@/components/ui/SectionHead";
import { CmsText } from "@/components/ui/CmsText";
import { Media } from "@/components/ui/Media";
import { Icon, hasIcon } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { StatRow, hasVisibleStats } from "@/components/ui/StatRow";
import { DownloadGate } from "@/components/forms/GatedDownload";
import { Marquee } from "@/components/ui/Marquee";
import { MenuBrowser } from "./MenuBrowser";
import styles from "./BrandBlocks.module.css";

/* ---------------------------------------------------------------- Story */
export function BrandStory({ brand, label, pillars }: { brand: BrandDetail; label: Section | undefined; pillars: ContentItem[] }) {
  const body = paragraphs(present(brand.storyBody));
  if (!present(brand.storyHeading) && body.length === 0) return null;
  return (
    <Band tone="brand-surface" labelledBy="story-title">
      <Container className={styles.story}>
        <SectionHead id="story-title" eyebrow={label?.eyebrow} heading={brand.storyHeading} layout="stack" />
        <div className={styles.storyBody}>
          {body.map((p, i) => (
            <Reveal key={i} index={i}>
              <CmsText as="p" value={p} className={i === 0 ? styles.lead : undefined} />
            </Reveal>
          ))}
          {present(brand.differentiation) && (
            <Reveal index={body.length} as="blockquote" className={styles.pull}>
              <CmsText value={brand.differentiation} />
            </Reveal>
          )}
          {pillars.length > 0 && (
            <ul role="list" className={styles.pillars}>
              {pillars.map((p, i) => (
                <li key={p.id} data-reveal="up" style={{ "--i": i } as CSSProperties}>
                  {hasIcon(p.icon) && <Icon name={p.icon} size={22} />}
                  <div>
                    <p className={styles.pillarTitle}>{p.title}</p>
                    <CmsText as="p" value={p.body} className={styles.pillarBody} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </Band>
  );
}

/* ----------------------------------------------------------- Highlights */
export function BrandHighlights({ label, stats }: { label: Section | undefined; stats: StatItem[] }) {
  if (!hasVisibleStats(stats)) return null;
  return (
    <section className={styles.highlights} aria-label={label?.eyebrow ?? "Highlights"}>
      <Container>
        <StatRow stats={stats} size="md" />
      </Container>
    </section>
  );
}

/* ------------------------------------------------------- Menu & offering */
export function BrandMenu({
  brand,
  label,
  menu,
  menuDownload,
}: {
  brand: BrandDetail;
  label: Section | undefined;
  menu: ProductCategory[];
  menuDownload: DownloadOffer | undefined;
}) {
  if (menu.length === 0 && !menuDownload) return null;

  return (
    <Band tone="paper" labelledBy="menu-title">
      <Container>
        <SectionHead
          id="menu-title"
          eyebrow={label?.eyebrow}
          heading={label?.heading}
          body={label?.body}
          actions={
            menuDownload && (
              <DownloadGate
                downloadId={menuDownload.id}
                title={menuDownload.title}
                brandName={brand.name}
                kindLabel="Menu"
                triggerLabel={label?.cta?.label ?? "Download menu"}
              />
            )
          }
        />

        <MenuBrowser menu={menu} />
      </Container>
    </Band>
  );
}

/* ------------------------------------------------------------ Campaigns */
const KIND_LABEL: Record<string, string> = { campaign: "Campaign", launch: "New launch", programme: "Programme" };

export function BrandCampaigns({ label, campaigns }: { label: Section | undefined; campaigns: Campaign[] }) {
  if (campaigns.length === 0) return null;
  const [lead, ...more] = campaigns;
  return (
    <Band tone="ink" labelledBy="campaigns-title" className={styles.campaignBand}>
      <Container>
        <SectionHead id="campaigns-title" eyebrow={label?.eyebrow} heading={label?.heading} size="md" />
      </Container>

      <Marquee className={styles.ticker} speed={28}>
        {/* Repeated so even a single short title fills the track without gaps. */}
        {[0, 1, 2].flatMap((n) => campaigns.map((c) => ({ c, key: `${n}-${c.id}` }))).map(({ c, key }) => (
          <span key={key} className={styles.tickerItem}>
            {c.title}
            <Icon name="sparkle" size={28} className={styles.tickerMark} />
          </span>
        ))}
      </Marquee>

      <Container>
        <article className={styles.lead} aria-labelledby={`campaign-${lead.id}`}>
          <div className={styles.leadMedia}>
            <Media media={lead.media} sizes="(min-width: 900px) 55vw, 100vw" hint="Campaign visual" tone="brand" reveal />
            <span className={styles.campaignTag}>{KIND_LABEL[lead.kind] ?? lead.kind}</span>
          </div>
          <div className={styles.leadText}>
            <Reveal>
              <h3 id={`campaign-${lead.id}`} className={styles.leadTitle}>
                {lead.title}
              </h3>
            </Reveal>
            <Reveal index={1}>
              <CmsText as="p" value={lead.body} className={styles.leadBody} />
            </Reveal>
            {lead.cta && (
              <Reveal index={2}>
                <ButtonLink href={lead.cta.href} tone="brand" size="lg">
                  {lead.cta.label}
                </ButtonLink>
              </Reveal>
            )}
          </div>
        </article>

        {more.length > 0 && (
          <ul role="list" className={styles.moreCampaigns}>
            {more.map((c, i) => (
              <li key={c.id} className={styles.moreCampaign} data-reveal="up" style={{ "--i": i } as CSSProperties}>
                <Media media={c.media} aspect="4 / 5" sizes="8rem" hint="Campaign visual" tone="brand" className={styles.moreMedia} />
                <div className={styles.moreText}>
                  <span className={styles.moreKind}>{KIND_LABEL[c.kind] ?? c.kind}</span>
                  <h3 className={styles.moreTitle}>{c.title}</h3>
                  <CmsText as="p" value={c.body} className={styles.moreBody} />
                  {c.cta && (
                    <ButtonLink href={c.cta.href} variant="link" tone="paper">
                      {c.cta.label}
                    </ButtonLink>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Band>
  );
}

/* ---------------------------------------------------------- Order online */
export function BrandOrder({ label, links }: { label: Section | undefined; links: DeliveryLink[] }) {
  if (links.length === 0) return null;
  return (
    <Band tone="brand" labelledBy="order-title" spacing="tight">
      <Container className={styles.order}>
        <div>
          <p className="label">{label?.eyebrow}</p>
          <h2 id="order-title" className={styles.orderTitle}>
            {label?.heading}
          </h2>
        </div>
        <ul role="list" className={styles.orderLinks}>
          {links.map((l) => (
            <li key={l.url}>
              <a href={l.url} target="_blank" rel="noopener noreferrer" className={styles.orderLink}>
                {l.platform}
                <Icon name="arrow-up-right" size={22} />
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </Band>
  );
}

/* ------------------------------------------------------------ Downloads */
export function BrandDownloads({ brand, label, downloads }: { brand: BrandDetail; label: Section | undefined; downloads: DownloadOffer[] }) {
  if (downloads.length === 0) return null;
  return (
    <Band tone="cream" labelledBy="downloads-title" spacing="tight">
      <Container>
        <SectionHead id="downloads-title" eyebrow={label?.eyebrow} heading={label?.heading} body={label?.body} size="md" />
        <ul role="list" className={styles.downloads}>
          {downloads.map((d) => (
            <li key={d.id} className={styles.download}>
              <span className={styles.downloadKind}>{d.kind === "menu" ? "Menu" : "Brochure"}</span>
              <div>
                <h3 className={styles.downloadTitle}>{d.title}</h3>
                <CmsText as="p" value={d.description} className={styles.downloadDesc} />
              </div>
              <DownloadGate
                downloadId={d.id}
                title={d.title}
                brandName={brand.name}
                kindLabel={d.kind === "menu" ? "Menu" : "Brochure"}
                onPageHref={d.kind === "menu" ? "#menu" : undefined}
              />
            </li>
          ))}
        </ul>
      </Container>
    </Band>
  );
}
