"use client";

import { useRef, type ReactNode } from "react";
import styles from "./Tilt.module.css";

/**
 * Pointer-driven 3D tilt with a soft light glare. CSS transforms only — no layout
 * shift, nothing on touch devices or for reduced motion (handled in CSS + here).
 */
export function Tilt({ children, className, max = 7 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--rx", `${((0.5 - y) * max * 2).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${((x - 0.5) * max * 2).toFixed(2)}deg`);
      el.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
      el.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
      el.dataset.active = "";
    });
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    delete el.dataset.active;
  };

  return (
    <div ref={ref} className={[styles.tilt, className].filter(Boolean).join(" ")} onPointerMove={onMove} onPointerLeave={onLeave}>
      <div className={styles.inner}>
        {children}
        <span className={styles.glare} aria-hidden="true" />
      </div>
    </div>
  );
}
