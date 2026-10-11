"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import type { GalleryItem } from "@/lib/cms/types";
import { Icon } from "./Icon";
import styles from "./Gallery.module.css";

/** Editorial masonry grid with a keyboard/touch-friendly lightbox. */
export function Gallery({ items, label }: { items: GalleryItem[]; label: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const close = useCallback(() => setIndex(null), []);
  const step = useCallback((dir: 1 | -1) => setIndex((i) => (i === null ? i : (i + dir + items.length) % items.length)), [items.length]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [index, close, step]);

  if (items.length === 0) return null;
  const current = index === null ? null : items[index];

  return (
    <>
      <ul role="list" className={styles.grid} aria-label={label}>
        {items.map((item, i) => (
          <li key={item.id} className={styles.item} data-reveal="up" style={{ "--i": i % 4 } as CSSProperties}>
            <button type="button" className={styles.thumb} onClick={() => setIndex(i)} aria-label={`Open image: ${item.media.alt || item.caption || label}`}>
              <Image
                src={item.media.url}
                alt={item.media.alt}
                width={item.media.width ?? 1200}
                height={item.media.height ?? 900}
                sizes="(min-width: 1100px) 33vw, (min-width: 640px) 50vw, 100vw"
                className={styles.image}
              />
              {item.tag && <span className={styles.tag}>{item.tag}</span>}
            </button>
            {item.caption && <p className={styles.caption}>{item.caption}</p>}
          </li>
        ))}
      </ul>

      {current && (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={current.caption ?? label} onClick={close}>
          <figure className={styles.figure} onClick={(e) => e.stopPropagation()}>
            <Image
              src={current.media.url}
              alt={current.media.alt}
              width={current.media.width ?? 1600}
              height={current.media.height ?? 1200}
              sizes="90vw"
              className={styles.full}
              quality={85}
            />
            {current.caption && <figcaption>{current.caption}</figcaption>}
          </figure>
          <button type="button" className={`${styles.nav} ${styles.close}`} onClick={close} aria-label="Close" autoFocus>
            <Icon name="close" size={22} />
          </button>
          {items.length > 1 && (
            <>
              <button type="button" className={`${styles.nav} ${styles.prev}`} onClick={(e) => (e.stopPropagation(), step(-1))} aria-label="Previous image">
                <Icon name="arrow" size={22} style={{ transform: "rotate(180deg)" }} />
              </button>
              <button type="button" className={`${styles.nav} ${styles.next}`} onClick={(e) => (e.stopPropagation(), step(1))} aria-label="Next image">
                <Icon name="arrow" size={22} />
              </button>
              <p className={styles.counter}>
                {index! + 1} / {items.length}
              </p>
            </>
          )}
        </div>
      )}
    </>
  );
}
