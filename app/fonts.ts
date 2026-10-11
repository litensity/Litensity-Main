import { Big_Shoulders, Bricolage_Grotesque, Fraunces, Inter_Tight } from "next/font/google";

/** Editorial display serif — the Litensity voice. */
export const fontDisplay = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

/** UI + body. */
export const fontSans = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

/** Brand typeface presets (selected per brand in the CMS). Not preloaded — only brand pages use them. */
export const fontCondensed = Big_Shoulders({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-condensed",
  adjustFontFallback: false,
  fallback: ["Arial Narrow", "sans-serif"],
  display: "swap",
  preload: false,
});

export const fontGrotesk = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
  preload: false,
});
