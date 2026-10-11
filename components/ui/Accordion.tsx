import type { ReactNode } from "react";
import { Icon } from "./Icon";
import styles from "./Accordion.module.css";

export interface AccordionItem {
  id: string;
  title: ReactNode;
  meta?: ReactNode;
  content: ReactNode;
}

/**
 * Native <details> accordion — keyboard and screen-reader accessible with zero JS.
 * Items sharing `name` behave exclusively (one open at a time) in modern browsers.
 */
export function Accordion({ items, name, className }: { items: AccordionItem[]; name?: string; className?: string }) {
  return (
    <div className={[styles.list, className].filter(Boolean).join(" ")}>
      {items.map((item) => (
        <details key={item.id} name={name} className={styles.item}>
          <summary className={styles.summary}>
            <span className={styles.title}>{item.title}</span>
            {item.meta && <span className={styles.meta}>{item.meta}</span>}
            <span className={styles.toggle} aria-hidden="true">
              <Icon name="plus" size={22} />
            </span>
          </summary>
          <div className={styles.content}>{item.content}</div>
        </details>
      ))}
    </div>
  );
}
