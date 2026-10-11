/** Colour helpers so CMS-supplied brand colours always get accessible text. */

function channel(hex: string, i: number): number {
  const v = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function luminance(hex: string): number {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return 0;
  return 0.2126 * channel(hex, 0) + 0.7152 * channel(hex, 1) + 0.0722 * channel(hex, 2);
}

export function contrastRatio(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Picks whichever candidate has the higher contrast against `background`. */
export function readableOn(background: string, light = "#FBF8F3", dark = "#16110D"): string {
  return contrastRatio(background, light) >= contrastRatio(background, dark) ? light : dark;
}

/** WCAG minimum for large text and UI accents — below this the brand colour can't carry text. */
const MIN_ACCENT_CONTRAST = 3;

/**
 * CSS custom properties that theme a subtree to a brand.
 * `--brand-text` / `--brand-on-dark` are the brand colour where it reads against the
 * brand surface / ink, and fall back to ink / surface where it doesn't (e.g. a yellow brand).
 */
export function brandVars(colors: { primary: string; ink: string; surface: string }): Record<string, string> {
  const onLight = contrastRatio(colors.primary, colors.surface) >= MIN_ACCENT_CONTRAST ? colors.primary : colors.ink;
  const onDark = contrastRatio(colors.primary, colors.ink) >= MIN_ACCENT_CONTRAST ? colors.primary : colors.surface;
  return {
    "--brand": colors.primary,
    "--brand-ink": colors.ink,
    "--brand-surface": colors.surface,
    "--brand-contrast": readableOn(colors.primary, "#FBF8F3", colors.ink),
    "--brand-text": onLight,
    "--brand-on-dark": onDark,
    "--brand-on-dark-contrast": readableOn(onDark, "#FBF8F3", colors.ink),
  };
}
