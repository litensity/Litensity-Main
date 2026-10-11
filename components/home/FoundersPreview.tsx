import type { Person, Section } from "@/lib/cms/types";
import { Container, Eyebrow, Section as Band } from "@/components/ui/Layout";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { CmsText } from "@/components/ui/CmsText";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { PersonCard } from "@/components/people/PersonCard";
import styles from "./FoundersPreview.module.css";

export function FoundersPreview({ section, founders }: { section: Section | undefined; founders: Person[] }) {
  if (!section || founders.length === 0) return null;
  return (
    <Band tone="paper" labelledBy="founders-title" className={styles.band}>
      <Container>
        <div className={styles.head}>
          <div>
            <Eyebrow index={5}>{section.eyebrow}</Eyebrow>
            <SplitHeading id="founders-title" text={section.heading} className={styles.heading} />
          </div>
          <div className={styles.side}>
            <Reveal index={2}>
              <CmsText as="p" value={section.body} className={styles.body} />
            </Reveal>
            {section.cta && (
              <Reveal index={3}>
                <ButtonLink href={section.cta.href} variant="outline">
                  {section.cta.label}
                </ButtonLink>
              </Reveal>
            )}
          </div>
        </div>
        <div className={styles.grid} data-count={founders.length}>
          {founders.map((f, i) => (
            <div key={f.id} className={styles.item}>
              <PersonCard person={f} index={i} />
            </div>
          ))}
        </div>
      </Container>
    </Band>
  );
}
