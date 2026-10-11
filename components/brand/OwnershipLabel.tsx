import type { Enums } from "@/types/database";
import styles from "./OwnershipLabel.module.css";

const LABELS: Record<Enums<"brand_ownership">, string> = {
  homegrown: "Homegrown",
  franchise: "Franchise",
};

/** Homegrown vs franchise tag shown on every brand card (PRD §7.1). */
export function OwnershipLabel({ ownership, className }: { ownership: Enums<"brand_ownership">; className?: string }) {
  return (
    <span className={[styles.label, styles[ownership], className].filter(Boolean).join(" ")}>
      <span className={styles.dot} aria-hidden="true" />
      {LABELS[ownership]}
    </span>
  );
}
