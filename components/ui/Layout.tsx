import type { CSSProperties, ElementType, ReactNode } from "react";
import styles from "./Layout.module.css";

export function Container({
  children,
  className,
  as: Tag = "div",
  wide,
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  wide?: boolean;
}) {
  return <Tag className={[styles.container, wide ? styles.wide : "", className].filter(Boolean).join(" ")}>{children}</Tag>;
}

export type SectionTone = "paper" | "cream" | "ink" | "brand" | "ember" | "brand-surface";

export function Section({
  children,
  tone = "paper",
  id,
  className,
  spacing = "default",
  labelledBy,
  style,
}: {
  children: ReactNode;
  tone?: SectionTone;
  id?: string;
  className?: string;
  spacing?: "default" | "tight" | "none";
  labelledBy?: string;
  style?: CSSProperties;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      data-tone={tone}
      style={style}
      className={[styles.section, styles[`tone-${tone}`], styles[`space-${spacing}`], className].filter(Boolean).join(" ")}
    >
      {children}
    </section>
  );
}

/** Small uppercase label above headings. `index` is accepted for call-site compatibility but no longer rendered (section numbers carry no information). */
export function Eyebrow({ children, className }: { children: ReactNode; index?: number; className?: string }) {
  if (!children) return null;
  return (
    <p className={[styles.eyebrow, "label", className].filter(Boolean).join(" ")}>
      <span>{children}</span>
    </p>
  );
}
