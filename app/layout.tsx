import type { Metadata, Viewport } from "next";
import { fontCondensed, fontDisplay, fontGrotesk, fontSans } from "./fonts";
import { siteUrl } from "@/lib/site-url";
import { RevealObserver } from "@/components/ui/RevealObserver";
import "./styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
};

export const viewport: Viewport = {
  themeColor: "#16110d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-IN"
      className={`${fontDisplay.variable} ${fontSans.variable} ${fontCondensed.variable} ${fontGrotesk.variable}`}
      // Lets Next skip smooth scrolling during route changes (globals.css sets it on <html>).
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body>
        {children}
        <RevealObserver />
      </body>
    </html>
  );
}
