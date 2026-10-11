"use client";

import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { Product, ProductCategory } from "@/lib/cms/types";
import { CmsText } from "@/components/ui/CmsText";
import { Media } from "@/components/ui/Media";
import { Icon } from "@/components/ui/Icon";
import styles from "./MenuBrowser.module.css";

interface Tab {
  key: string;
  name: string;
  description: string | null;
  feature: ProductCategory["media"];
  products: Product[];
}

/**
 * The menu as a browsable index: one category on screen at a time, every product shown with its photo.
 * All panels stay in the HTML (inactive ones `hidden`) so the full menu is crawlable and works without JS.
 */
export function MenuBrowser({ menu, bestsellerLabel = "Bestsellers" }: { menu: ProductCategory[]; bestsellerLabel?: string }) {
  const tabs = buildTabs(menu, bestsellerLabel);
  const [active, setActive] = useState(0);
  const [animate, setAnimate] = useState(false);
  const uid = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const browserRef = useRef<HTMLDivElement>(null);

  if (tabs.length === 0) return null;

  function select(i: number, focus = false) {
    setAnimate(true);
    setActive(i);
    if (focus) tabRefs.current[i]?.focus();
    // When the visitor has scrolled into a long panel, bring the new category's top back into view.
    const top = browserRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      browserRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  }

  function onKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const last = tabs.length - 1;
    const next = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: last }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    select(next < 0 ? last : next > last ? 0 : next, true);
  }

  return (
    <div ref={browserRef} className={styles.browser}>
      <div className={styles.index} role="tablist" aria-label="Menu categories">
        {tabs.map((t, i) => (
          <button
            key={t.key}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${uid}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${uid}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            className={styles.tab}
            onClick={() => select(i)}
            onKeyDown={(e) => onKey(e, i)}
          >
            <Icon name="arrow" size={18} className={styles.tabArrow} />
            <span className={styles.tabName}>{t.name}</span>
            <span className={styles.tabCount}>{t.products.length}</span>
          </button>
        ))}
      </div>

      {tabs.map((t, i) => (
        <section
          key={t.key}
          id={`${uid}-panel-${i}`}
          role="tabpanel"
          aria-labelledby={`${uid}-tab-${i}`}
          hidden={i !== active}
          className={styles.panel}
          data-animate={animate && i === active ? "" : undefined}
        >
          <header className={styles.panelHead}>
            <h3 className={styles.panelName}>{t.name}</h3>
            <p className={styles.panelCount}>
              {t.products.length} {t.products.length === 1 ? "item" : "items"}
            </p>
            <CmsText as="p" value={t.description} className={styles.panelDesc} />
          </header>

          {t.products.length > 0 ? (
            <ul role="list" className={styles.grid}>
              {t.feature && (
                <li className={styles.feature} aria-hidden="true" style={{ "--i": 0 } as CSSProperties}>
                  <Media media={t.feature} sizes="(min-width: 900px) 40vw, 100vw" tone="brand" className={styles.featureMedia} />
                </li>
              )}
              {t.products.map((p, pi) => (
                <ProductTile key={p.id} product={p} index={pi + (t.feature ? 1 : 0)} />
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>
              <CmsText value="[CLIENT CONTENT REQUIRED] Products for this category" />
            </p>
          )}
        </section>
      ))}
    </div>
  );
}

function ProductTile({ product: p, index }: { product: Product; index: number }) {
  return (
    <li className={styles.tile} style={{ "--i": Math.min(index, 9) } as CSSProperties}>
      <div className={styles.tileFrame}>
        {p.media ? (
          <Media media={p.media} alt="" aspect="4 / 5" sizes="(min-width: 1200px) 18vw, (min-width: 900px) 22vw, 46vw" tone="brand" className={styles.tileMedia} />
        ) : (
          // No photograph yet: the name itself becomes the picture, in the brand's own type.
          <div className={styles.typeTile} aria-hidden="true">
            <CmsText value={p.name} />
          </div>
        )}
        {p.isBestseller && <span className={styles.badge}>Bestseller</span>}
      </div>
      <div className={styles.tileText}>
        <p className={styles.tileName}>
          {p.isVeg !== null && (
            <span className={p.isVeg ? styles.veg : styles.nonveg} role="img" aria-label={p.isVeg ? "Vegetarian" : "Non-vegetarian"} />
          )}
          <CmsText value={p.name} />
        </p>
        {p.priceLabel && <p className={styles.price}>{p.priceLabel}</p>}
      </div>
      <CmsText as="p" value={p.description} className={styles.tileDesc} />
    </li>
  );
}

/** Bestsellers (when any are flagged) lead; each category's own image joins its grid only if no product already uses it. */
function buildTabs(menu: ProductCategory[], bestsellerLabel: string): Tab[] {
  const tabs: Tab[] = menu.map((c) => {
    const used = new Set(c.products.map((p) => p.media?.id).filter(Boolean));
    return {
      key: c.id,
      name: c.name,
      description: c.description,
      feature: c.media && !used.has(c.media.id) ? c.media : null,
      products: c.products,
    };
  });
  const bestsellers = menu.flatMap((c) => c.products.filter((p) => p.isBestseller));
  if (bestsellers.length > 0) tabs.unshift({ key: "bestsellers", name: bestsellerLabel, description: null, feature: null, products: bestsellers });
  return tabs;
}
