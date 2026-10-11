"use client";

import { useEffect, useState } from "react";
import styles from "./BrandNav.module.css";

/** Sticky in-page navigation with scroll-spy for long brand pages. */
export function BrandNav({ items, brandName }: { items: { id: string; label: string }[]; brandName: string }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const targets = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => Boolean(el));
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav className={styles.nav} aria-label={`${brandName} sections`}>
      <ul role="list" className={styles.list}>
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className={styles.link} aria-current={active === item.id ? "location" : undefined}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
