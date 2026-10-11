"use client";

import { useEffect } from "react";

const MAX = 8; // px — a nudge, not a chase

/**
 * One pointer listener for the whole site: elements marked [data-magnetic] lean slightly
 * toward the cursor while it is over them. Fine pointers only; off for reduced motion.
 */
export function MagneticField() {
  useEffect(() => {
    const ok = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!ok.matches) return;
    let current: HTMLElement | null = null;

    const release = (el: HTMLElement) => {
      el.style.removeProperty("--mx");
      el.style.removeProperty("--my");
    };

    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (current && current !== el) release(current);
      current = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      el.style.setProperty("--mx", `${(dx * MAX).toFixed(1)}px`);
      el.style.setProperty("--my", `${(dy * MAX * 0.6).toFixed(1)}px`);
    };

    const onLeave = () => {
      if (current) release(current);
      current = null;
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return null;
}
