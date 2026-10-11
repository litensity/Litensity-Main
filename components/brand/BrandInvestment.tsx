import type { CSSProperties, ReactNode } from "react";
import type { BrandDetail, ContentItem, DownloadOffer, Faq, InvestmentModel, Section } from "@/lib/cms/types";
import { isDev, paragraphs, present } from "@/lib/content";
import { Container } from "@/components/ui/Layout";
import { SectionHead } from "@/components/ui/SectionHead";
import { CmsText } from "@/components/ui/CmsText";
import { PillarList } from "@/components/ui/PillarList";
import { Accordion } from "@/components/ui/Accordion";
import { DownloadGate } from "@/components/forms/GatedDownload";
import { FranchiseForm, GeneralForm } from "@/components/forms/Forms";
import { Section as Band } from "@/components/ui/Layout";
import styles from "./BrandInvestment.module.css";

/*
 * Investment / franchise blocks. Every block returns null unless the brand's
 * investment switch is on — for Belgian Waffle none of this reaches the HTML.
 * Figures appear only once confirmed in writing.
 */

function Dark({ children, label, part }: { children: ReactNode; label: string; part?: boolean }) {
  return (
    <section className={`${styles.invest} ${part ? styles.part : ""}`} aria-labelledby={label}>
      <Container>{children}</Container>
    </section>
  );
}

export function InvestIntro({ brand, label, models, brochure }: { brand: BrandDetail; label: Section; models: InvestmentModel[]; brochure?: DownloadOffer }) {
  if (!brand.features.investment) return null;
  return (
    <Dark label="invest-title">
      <SectionHead
        id="invest-title"
        eyebrow={label.eyebrow}
        heading={brand.investment.heading}
        body={brand.investment.intro}
        actions={
          brochure && (
            <DownloadGate downloadId={brochure.id} title={brochure.title} brandName={brand.name} kindLabel="Brochure" triggerLabel={label.cta?.label ?? "Download franchise brochure"} />
          )
        }
      />
      {models.length > 0 && (
        <div className={styles.block}>
          <p className={`label ${styles.blockLabel}`}>{label.subheading}</p>
          <ul role="list" className={styles.models} data-count={models.length}>
            {models.map((m, i) => (
              <li key={m.id} className={styles.model} data-reveal="up" style={{ "--i": i } as CSSProperties}>
                <p className={styles.modelIndex}>{String(i + 1).padStart(2, "0")}</p>
                <h3 className={styles.modelName}>
                  <CmsText value={m.name} />
                </h3>
                {m.format && m.format !== m.name && <p className={styles.modelFormat}>{m.format}</p>}
                {paragraphs(m.description).map((p, j) => (
                  <CmsText key={j} as="p" value={p} className={styles.modelDesc} />
                ))}
                {m.includes.length > 0 && (
                  <ul className={styles.includes}>
                    {m.includes.map((inc) => (
                      <li key={inc}>{inc}</li>
                    ))}
                  </ul>
                )}
                <ModelFigures model={m} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </Dark>
  );
}

export function InvestSupport({ brand, label, items }: { brand: BrandDetail; label: Section; items: ContentItem[] }) {
  if (!brand.features.investment || items.length === 0) return null;
  return (
    <Dark label="support-title" part>
      <SectionHead id="support-title" eyebrow={label.eyebrow} heading={label.heading} size="md" />
      <PillarList items={items} columns={3} numbered={false} />
    </Dark>
  );
}

export function InvestProcess({ brand, label, items }: { brand: BrandDetail; label: Section; items: ContentItem[] }) {
  if (!brand.features.investment || items.length === 0) return null;
  return (
    <Dark label="process-title" part>
      <SectionHead id="process-title" eyebrow={label.eyebrow} heading={label.heading} size="md" />
      <ol role="list" className={styles.process}>
        {items.map((step, i) => (
          <li key={step.id} className={styles.step} data-reveal="up" style={{ "--i": i } as CSSProperties}>
            <span className={styles.stepIndex}>{i + 1}</span>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <CmsText as="p" value={step.body} className={styles.stepBody} />
            {step.meta && <p className={styles.stepMeta}>{step.meta}</p>}
          </li>
        ))}
      </ol>
    </Dark>
  );
}

export function InvestFaq({ brand, label, faqs }: { brand: BrandDetail; label: Section; faqs: Faq[] }) {
  if (!brand.features.investment || faqs.length === 0) return null;
  return (
    <Dark label="brand-faq-title" part>
      <div className={styles.faq}>
        <SectionHead id="brand-faq-title" eyebrow={label.eyebrow} heading={label.heading} size="md" layout="stack" />
        <Accordion
          name={`faq-${brand.slug}`}
          items={faqs.map((f) => ({
            id: f.id,
            title: f.question,
            content: paragraphs(f.answer).map((p, i) => <CmsText key={i} as="p" value={p} />),
          }))}
        />
      </div>
    </Dark>
  );
}

/** Franchise form for investment brands; a brand-tagged customer enquiry for the rest. */
export function BrandEnquiry({ brand, label }: { brand: BrandDetail; label: Section }) {
  if (brand.features.investmentEnquiry) {
    return (
      <Dark label="franchise-form-title" part>
        <div id="enquire-form" className={styles.enquiry}>
          <SectionHead id="franchise-form-title" eyebrow={label.eyebrow} heading={label.heading} body={label.body} size="md" />
          <FranchiseForm brand={brand} tone="dark" />
        </div>
      </Dark>
    );
  }
  return (
    <Band tone="brand-surface" labelledBy="brand-contact-title">
      <Container>
        <SectionHead id="brand-contact-title" eyebrow={label.eyebrow} heading={label.heading} body={label.body} />
        <GeneralForm brandSlug={brand.slug} />
      </Container>
    </Band>
  );
}

function ModelFigures({ model }: { model: InvestmentModel }) {
  if (!model.figures) {
    return isDev ? (
      <p className={styles.figuresPending}>
        <span className="cms-missing">Figures hidden until Litensity confirms them in writing</span>
      </p>
    ) : null;
  }
  const rows = [
    ["Investment", model.figures.investmentRange],
    ["Area", model.figures.areaRequirement],
    ["Payback", model.figures.paybackRange],
    ["Returns", model.figures.returnRange],
  ].filter(([, v]) => present(v)) as [string, string][];
  if (rows.length === 0) return null;
  return (
    <>
      <dl className={styles.figures}>
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {present(model.figures.assumptions) && <p className={styles.assumptions}>{model.figures.assumptions}</p>}
    </>
  );
}
