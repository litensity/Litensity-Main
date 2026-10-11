import type { CSSProperties } from "react";
import type { Store } from "@/lib/cms/types";
import { INDIA_PATH, INDIA_VIEWBOX, projectIndia } from "@/lib/geo/india";
import styles from "./IndiaDotMap.module.css";

/** Locator deep link for one store's brand, state and city. */
export function locatorHref(store: Store): string {
  const q = new URLSearchParams({ brand: store.brand.slug, state: store.state, city: store.city });
  return `/stores?${q.toString()}`;
}

/**
 * Lightweight, server-rendered India map with one brand-coloured dot per live store.
 * With `linked`, every pin is a link into the locator and carries data for a hover tooltip.
 */
export function IndiaDotMap({ stores, className, label, linked = false }: { stores: Store[]; className?: string; label: string; linked?: boolean }) {
  const live = stores.filter((s) => s.status === "live");
  return (
    <svg
      viewBox={`0 0 ${INDIA_VIEWBOX.width} ${INDIA_VIEWBOX.height}`}
      className={[styles.map, className].filter(Boolean).join(" ")}
      role={linked ? "group" : "img"}
      aria-label={label}
    >
      <defs>
        <pattern id="india-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="2.2" className={styles.gridDot} />
        </pattern>
      </defs>
      <path d={INDIA_PATH} className={styles.land} />
      <path d={INDIA_PATH} fill="url(#india-dots)" />
      <path d={INDIA_PATH} className={styles.outline} />
      {live.map((store, i) => {
        const { x, y } = projectIndia(store.latitude, store.longitude);
        const pin = (
          <>
            <circle r="16" className={styles.pulse} />
            <circle r="7.5" className={styles.pin} />
            <circle r="22" className={styles.hit} />
          </>
        );
        const style = { "--c": store.brand.color, "--i": i % 12 } as CSSProperties;
        const transform = `translate(${x.toFixed(1)} ${y.toFixed(1)})`;
        return linked ? (
          <a
            key={store.id}
            href={locatorHref(store)}
            style={style}
            className={styles.pinLink}
            data-pin=""
            data-brand={store.brand.slug}
            data-brand-name={store.brand.name}
            data-store={store.name}
            data-place={[store.locality, store.city].filter(Boolean).join(", ")}
            aria-label={`${store.brand.name} — ${store.name}, ${store.city}. Open in the store locator`}
          >
            <g transform={transform}>{pin}</g>
          </a>
        ) : (
          <g key={store.id} transform={transform} style={style}>
            {pin}
            <title>{`${store.brand.name} — ${store.name}, ${store.city}`}</title>
          </g>
        );
      })}
    </svg>
  );
}
