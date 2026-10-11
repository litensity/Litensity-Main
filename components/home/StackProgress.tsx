"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Drives the stacking-card effect. For every card it writes two CSS variables:
 *   --enter  0→1 while the card travels up to its sticky position (photo zoom settles)
 *   --cover  0→1 while the next card slides over it (scale down + dim)
 * and marks the card currently on top with data-active (counter highlight).
 * Desktop and phones tall enough to stack (matches the CSS), with motion allowed; otherwise a plain list.
 */
export function StackProgress({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    const motion = window.matchMedia(
      "(min-width: 900px) and (prefers-reduced-motion: no-preference), (max-width: 899px) and (min-height: 620px) and (prefers-reduced-motion: no-preference)",
    );
    let frame = 0;

    const update = () => {
      frame = 0;
      const cards = Array.from(list.children) as HTMLElement[];
      if (!motion.matches) {
        cards.forEach((c) => {
          c.style.removeProperty("--enter");
          c.style.removeProperty("--cover");
          c.removeAttribute("data-active");
        });
        return;
      }
      const vh = window.innerHeight;
      let active = 0;
      cards.forEach((card, i) => {
        const stick = parseFloat(getComputedStyle(card).top) || 0;
        const top = card.getBoundingClientRect().top;
        const enter = Math.min(1, Math.max(0, (vh - top) / Math.max(1, vh - stick)));
        const next = cards[i + 1];
        let cover = 0;
        if (next) {
          const nextTop = next.getBoundingClientRect().top;
          const span = Math.max(1, card.offsetHeight);
          cover = Math.min(1, Math.max(0, 1 - (nextTop - stick) / span));
        }
        if (top <= stick + 2) active = i;
        card.style.setProperty("--enter", enter.toFixed(3));
        card.style.setProperty("--cover", cover.toFixed(3));
      });
      cards.forEach((c, i) => c.toggleAttribute("data-active", i === active));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    motion.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      motion.removeEventListener("change", schedule);
    };
  }, []);

  return (
    <ol ref={ref} role="list" className={className}>
      {children}
    </ol>
  );
}
