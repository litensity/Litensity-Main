import type { CSSProperties } from "react";
import type { StatItem } from "@/lib/cms/types";
import { isDev, present } from "@/lib/content";
import { CountUp } from "./CountUp";
import styles from "./StatRow.module.css";

/**
 * Highlights row. Values that are not supplied/confirmed are never shown publicly;
 * in development they appear as "awaiting data" so gaps are visible.
 */
export function StatRow({
  stats,
  className,
  size = "lg",
  layout = "row",
}: {
  stats: StatItem[];
  className?: string;
  size?: "md" | "lg";
  /** "grid" = two columns (used beside a heading); "row" = one line on desktop. */
  layout?: "row" | "grid";
}) {
  const visible = stats.filter((s) => (s.value !== null && present(s.label)) || isDev);
  if (visible.length === 0) return null;

  return (
    <dl className={[styles.row, styles[size], layout === "grid" ? styles.grid : "", className].filter(Boolean).join(" ")}>
      {visible.map((stat, i) => (
        <div key={stat.id} className={styles.stat} data-reveal="up" style={{ "--i": i } as CSSProperties}>
          <dt className={styles.label}>{present(stat.label) ?? stat.label}</dt>
          <dd className={styles.value}>
            {stat.value !== null ? (
              <>
                <CountUp value={stat.value} duration={1100} />
                {stat.suffix && <span className={styles.suffix}>{stat.suffix}</span>}
              </>
            ) : (
              <span className={styles.pending} title="Awaiting client data">
                —<span className="cms-missing">awaiting data</span>
              </span>
            )}
          </dd>
          {stat.note && <dd className={styles.note}>{stat.note}</dd>}
        </div>
      ))}
    </dl>
  );
}

/** True when a stat row would render something (lets sections hide themselves). */
export function hasVisibleStats(stats: StatItem[]): boolean {
  return isDev ? stats.length > 0 : stats.some((s) => s.value !== null);
}
