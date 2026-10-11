import Link from "next/link";
import type { CSSProperties } from "react";
import type { ContentItem } from "@/lib/cms/types";
import { CmsText } from "./CmsText";
import { Icon, hasIcon } from "./Icon";
import { ScrollActiveList } from "./ScrollActiveList";
import styles from "./PillarList.module.css";

/**
 * Numbered editorial list for repeatable CMS items (pillars, capabilities, values,
 * support, process steps). `meta` renders as a side note, e.g. a step duration.
 */
export function PillarList({
  items,
  numbered = true,
  columns = 1,
  className,
  trackActive = false,
}: {
  items: ContentItem[];
  numbered?: boolean;
  columns?: 1 | 2 | 3;
  className?: string;
  /** Highlight the row crossing the middle of the screen while scrolling (single-column lists). */
  trackActive?: boolean;
}) {
  if (items.length === 0) return null;
  const listClass = [styles.list, styles[`cols${columns}`], trackActive ? styles.tracked : "", className].filter(Boolean).join(" ");
  const rows = items.map((item, i) => {
    const inner = (
      <>
        <div className={styles.head}>
          {numbered && <span className={styles.index}>{String(i + 1).padStart(2, "0")}</span>}
          {hasIcon(item.icon) && (
            <span className={styles.icon}>
              <Icon name={item.icon} size={26} />
            </span>
          )}
        </div>
        <h3 className={styles.title}>
          <CmsText value={item.title} />
        </h3>
        <CmsText as="p" value={item.body} className={styles.body} />
        {item.meta && <p className={`label ${styles.meta}`}>{item.meta}</p>}
      </>
    );
    return (
      <li key={item.id} className={styles.item} data-reveal="up" style={{ "--i": i % 3 } as CSSProperties}>
        {item.href ? (
          <Link href={item.href} className={styles.link}>
            {inner}
          </Link>
        ) : (
          inner
        )}
      </li>
    );
  });
  return trackActive ? (
    <ScrollActiveList className={listClass}>{rows}</ScrollActiveList>
  ) : (
    <ol role="list" className={listClass}>
      {rows}
    </ol>
  );
}
