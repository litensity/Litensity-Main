import type { ReactNode } from "react";
import { Eyebrow } from "./Layout";
import { SplitHeading } from "./SplitHeading";
import { CmsText } from "./CmsText";
import { Reveal } from "./Reveal";
import styles from "./SectionHead.module.css";

/** Standard section header: eyebrow, display heading, optional lede and actions. */
export function SectionHead({
  id,
  eyebrow,
  index,
  heading,
  body,
  actions,
  layout = "split",
  size = "lg",
}: {
  id: string;
  eyebrow?: string | null;
  index?: number;
  heading: string | null | undefined;
  body?: string | null;
  actions?: ReactNode;
  layout?: "split" | "stack";
  size?: "md" | "lg";
}) {
  return (
    <header className={`${styles.head} ${styles[layout]} ${styles[size]}`}>
      <div className={styles.main}>
        <Eyebrow index={index}>{eyebrow}</Eyebrow>
        <SplitHeading id={id} text={heading} className={styles.heading} />
      </div>
      {(body || actions) && (
        <Reveal index={2} className={styles.side}>
          <CmsText as="p" value={body} className={styles.body} />
          {actions && <div className={styles.actions}>{actions}</div>}
        </Reveal>
      )}
    </header>
  );
}
