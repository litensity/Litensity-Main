import type { CSSProperties, ReactNode } from "react";
import styles from "./Marquee.module.css";

type Items = ReactNode | ((duplicate: boolean) => ReactNode);

/**
 * Infinite horizontal ticker that pauses on hover. Pure CSS. The duplicate track is hidden
 * from assistive tech; pass a function to render it differently (e.g. links with tabIndex -1).
 */
export function Marquee({ children, speed = 40, className, label }: { children: Items; speed?: number; className?: string; label?: string }) {
  const render = (duplicate: boolean) => (typeof children === "function" ? children(duplicate) : children);
  return (
    <div
      className={[styles.marquee, className].filter(Boolean).join(" ")}
      style={{ "--speed": `${speed}s` } as CSSProperties}
      role={label ? "group" : undefined}
      aria-label={label}
    >
      <div className={styles.track}>{render(false)}</div>
      <div className={styles.track} aria-hidden="true">
        {render(true)}
      </div>
    </div>
  );
}
