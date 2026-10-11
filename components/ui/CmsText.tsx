import type { ElementType, ReactNode } from "react";
import { MISSING_MARKER, isDev, present } from "@/lib/content";

interface Props {
  value: string | null | undefined;
  as?: ElementType;
  className?: string;
  children?: (value: string) => ReactNode;
}

/**
 * Renders a CMS text field. Missing values render nothing; placeholder values are
 * flagged visually in development and dropped in production.
 */
export function CmsText({ value, as: Tag = "span", className, children }: Props) {
  const text = present(value);
  if (!text) return null;
  if (isDev && text.includes(MISSING_MARKER)) {
    return (
      <Tag className={className}>
        <span className="cms-missing" title="Client content required">
          {text.replace(MISSING_MARKER, "").trim() || "Client content required"}
        </span>
      </Tag>
    );
  }
  return <Tag className={className}>{children ? children(text) : text}</Tag>;
}
