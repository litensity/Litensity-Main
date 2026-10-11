"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import styles from "./FootprintPreview.module.css";

export interface FootprintBrand {
  slug: string;
  name: string;
  color: string;
  stores: number;
  cities: number;
  states: number;
}

interface Tip {
  x: number;
  y: number;
  href: string;
  brand: string;
  store: string;
  place: string;
  color: string;
}

/**
 * Client half of the footprint preview: brand chips filter the pins (and the counts),
 * and hovering or focusing a pin shows a store tooltip that links into the locator.
 * The map itself is server-rendered and passed in as `map`.
 */
export function FootprintExplorer({
  brands,
  total,
  map,
  mapLabel,
}: {
  brands: FootprintBrand[];
  total: { stores: number; cities: number; states: number };
  map: ReactNode;
  mapLabel: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number>(0);

  const counts = active ? (brands.find((b) => b.slug === active) ?? total) : total;

  // Dim pins of other brands.
  useEffect(() => {
    wrap.current?.querySelectorAll<SVGElement>("[data-pin]").forEach((pin) => {
      pin.toggleAttribute("data-dim", !!active && pin.dataset.brand !== active);
    });
  }, [active]);

  const choose = (slug: string | null) => {
    setTip(null);
    setActive((cur) => (slug === null || cur === slug ? null : slug));
  };

  // Tooltip via event delegation on the server-rendered pins.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const show = (e: Event) => {
      const pin = (e.target as Element | null)?.closest<SVGAElement>("[data-pin]");
      if (!pin || pin.hasAttribute("data-dim")) return;
      window.clearTimeout(hideTimer.current);
      const box = el.getBoundingClientRect();
      const r = pin.getBoundingClientRect();
      el.querySelectorAll("[data-current]").forEach((p) => p.removeAttribute("data-current"));
      pin.setAttribute("data-current", "");
      setTip({
        x: r.left + r.width / 2 - box.left,
        y: r.top - box.top,
        href: pin.getAttribute("href") ?? "/stores",
        brand: pin.dataset.brandName ?? "",
        store: pin.dataset.store ?? "",
        place: pin.dataset.place ?? "",
        color: getComputedStyle(pin).getPropertyValue("--c"),
      });
    };
    const hide = () => {
      hideTimer.current = window.setTimeout(() => {
        el.querySelectorAll("[data-current]").forEach((p) => p.removeAttribute("data-current"));
        setTip(null);
      }, 220);
    };
    el.addEventListener("pointerover", show);
    el.addEventListener("focusin", show);
    el.addEventListener("pointerleave", hide);
    el.addEventListener("focusout", hide);
    return () => {
      el.removeEventListener("pointerover", show);
      el.removeEventListener("focusin", show);
      el.removeEventListener("pointerleave", hide);
      el.removeEventListener("focusout", hide);
    };
  }, []);

  return (
    <>
      <div className={styles.controls}>
        <p className={styles.summary} aria-live="polite">
          <strong>{counts.stores}</strong> stores · <strong>{counts.cities}</strong> {counts.cities === 1 ? "city" : "cities"} ·{" "}
          <strong>{counts.states}</strong> {counts.states === 1 ? "state" : "states"}
        </p>
        <div className={styles.legend} role="group" aria-label="Filter the map by brand">
          <button type="button" className={styles.chip} aria-pressed={active === null} onClick={() => choose(null)}>
            All brands
          </button>
          {brands.map((b) => (
            <button
              key={b.slug}
              type="button"
              className={styles.chip}
              style={{ "--c": b.color } as CSSProperties}
              aria-pressed={active === b.slug}
              onClick={() => choose(b.slug)}
            >
              <span className={styles.chipDot} aria-hidden="true" />
              {b.name}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.mapWrap} ref={wrap} aria-label={mapLabel}>
        {map}
        {tip && (
          <div
            className={styles.tip}
            style={{ left: tip.x, top: tip.y, "--c": tip.color } as CSSProperties}
            onPointerEnter={() => window.clearTimeout(hideTimer.current)}
            onPointerLeave={() => setTip(null)}
          >
            <span className={styles.tipBrand}>{tip.brand}</span>
            <span className={styles.tipStore}>{tip.store}</span>
            <span className={styles.tipPlace}>{tip.place}</span>
            <Link href={tip.href} className={styles.tipLink} tabIndex={-1}>
              Open in store locator <Icon name="arrow" size={14} />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
