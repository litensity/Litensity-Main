import type { CSSProperties, ElementType, ReactNode } from "react";

type Variant = "up" | "fade" | "image";

interface Props {
  children: ReactNode;
  as?: ElementType;
  variant?: Variant;
  /** Stagger step (multiplied by --stagger). */
  index?: number;
  className?: string;
  style?: CSSProperties;
}

/** Marks content for the scroll reveal observer. Visible by default without JS. */
export function Reveal({ children, as: Tag = "div", variant = "up", index = 0, className, style }: Props) {
  return (
    <Tag data-reveal={variant} className={className} style={{ ...style, "--i": index } as CSSProperties}>
      {children}
    </Tag>
  );
}
