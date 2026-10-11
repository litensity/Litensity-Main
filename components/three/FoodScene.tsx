"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import type { SceneObject } from "@/lib/three/engine";
import styles from "./FoodScene.module.css";

interface Props {
  objects: SceneObject[];
  layout: "hero" | "single";
  className?: string;
  style?: CSSProperties;
}

/** Whether this device should get the 3D layer at all. */
function canRender3D(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData) return false;
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 2) return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Decorative, interactive 3D food objects. Progressive enhancement only:
 * loads Three.js lazily once visible and idle; nothing renders for reduced motion,
 * Save-Data or devices without WebGL, and the page reads exactly the same without it.
 */
export function FoodScene({ objects, layout, className, style }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [tip, setTip] = useState<{ label: string; x: number; y: number } | null>(null);
  const key = objects.map((o) => `${o.type}:${o.href}:${o.accent}`).join("|");

  useEffect(() => {
    const el = ref.current;
    if (!el || objects.length === 0 || !canRender3D()) return;
    let destroy: (() => void) | null = null;
    let cancelled = false;

    const start = () => {
      import("@/lib/three/engine").then(({ createFoodScene }) => {
        if (cancelled || !ref.current) return;
        destroy = createFoodScene(ref.current, {
          objects,
          layout,
          onHover: (label, x, y) => setTip(label ? { label, x, y } : null),
          onSelect: (href) => router.push(href),
        });
        setReady(true);
      });
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
        if (idle) idle(start, { timeout: 1200 });
        else setTimeout(start, 300);
      },
      { rootMargin: "200px" },
    );
    io.observe(el);

    return () => {
      cancelled = true;
      io.disconnect();
      destroy?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, layout]);

  return (
    <div ref={ref} className={[styles.scene, className].filter(Boolean).join(" ")} data-ready={ready || undefined} style={style} aria-hidden="true">
      {tip && (
        <span className={styles.tip} style={{ left: tip.x, top: tip.y }}>
          {tip.label} →
        </span>
      )}
    </div>
  );
}
