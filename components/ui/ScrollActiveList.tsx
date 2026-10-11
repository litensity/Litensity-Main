"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * An <ol> that marks the row crossing the middle of the viewport with data-active,
 * so CSS can highlight it while the visitor scrolls through the list.
 */
export function ScrollActiveList({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const rows = Array.from(list.children) as HTMLElement[];
      const mid = window.innerHeight * 0.5;
      let active = -1;
      rows.forEach((row, i) => {
        const r = row.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) active = i;
      });
      // Before the first row reaches the middle, or after the last has passed it, keep the nearest end lit.
      if (active === -1 && rows.length) {
        const first = rows[0].getBoundingClientRect();
        const last = rows[rows.length - 1].getBoundingClientRect();
        if (first.top > mid && first.top < window.innerHeight) active = 0;
        else if (last.bottom <= mid && last.bottom > 0) active = rows.length - 1;
      }
      rows.forEach((row, i) => row.toggleAttribute("data-active", i === active));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    list.setAttribute("data-tracking", "");
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <ol ref={ref} role="list" className={className}>
      {children}
    </ol>
  );
}
