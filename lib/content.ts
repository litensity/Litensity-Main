/** Marker used in seed/CMS for content the client still has to supply. */
export const MISSING_MARKER = "[CLIENT CONTENT REQUIRED]";

export const isDev = process.env.NODE_ENV !== "production";

export function isMissing(value: string | null | undefined): boolean {
  return !value || value.includes(MISSING_MARKER);
}

/**
 * Returns the value when it is real content. Placeholder values are returned
 * (visibly flagged by <CmsText>) only in development; production gets null so
 * an unfinished field disappears instead of shipping placeholder text.
 */
export function present(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.includes(MISSING_MARKER)) return isDev ? value : null;
  return value;
}

/** Splits CMS long text into paragraphs on blank lines. */
export function paragraphs(text: string | null | undefined): string[] {
  return (text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function whatsappHref(number: string, message?: string | null): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function isExternal(href: string): boolean {
  return /^(https?:)?\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
}
