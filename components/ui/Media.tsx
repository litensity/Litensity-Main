import Image from "next/image";
import type { CSSProperties } from "react";
import type { MediaAsset } from "@/lib/cms/media";
import { isDev } from "@/lib/content";
import { LoopVideo } from "./LoopVideo";
import styles from "./Media.module.css";

interface Props {
  media: MediaAsset | null | undefined;
  /** Responsive sizes hint for next/image. */
  sizes: string;
  /** Aspect ratio of the frame, e.g. "4 / 5". Omit to fill the parent. */
  aspect?: string;
  preload?: boolean;
  className?: string;
  /** Short description of the expected asset, shown on the dev placeholder. */
  hint?: string;
  alt?: string;
  quality?: 60 | 75 | 85;
  /** Image reveal (clip + scale) on scroll. */
  reveal?: boolean;
  tone?: "paper" | "ink" | "brand";
  /** Still frame shown before a video plays (and instead of it for reduced motion). */
  poster?: MediaAsset | null;
}

/**
 * The single way the site renders CMS imagery/video. A missing asset renders an
 * art-directed placeholder (labelled in development only) so layouts never collapse.
 */
export function Media({ media, sizes, aspect, preload, className, hint, alt, quality = 75, reveal, tone = "paper", poster }: Props) {
  const frameStyle = aspect ? ({ aspectRatio: aspect } as CSSProperties) : undefined;
  const frameClass = [styles.frame, aspect ? "" : styles.fill, className].filter(Boolean).join(" ");

  let content;
  if (!media) {
    content = (
      <div className={`${styles.placeholder} ${styles[tone]}`} aria-hidden="true">
        {isDev && <span className={styles.placeholderLabel}>Image required{hint ? ` · ${hint}` : ""}</span>}
      </div>
    );
  } else if (media.kind === "video") {
    const still = poster && poster.kind === "image" ? `/_next/image?url=${encodeURIComponent(poster.url)}&w=1920&q=75` : undefined;
    content = <LoopVideo src={media.url} poster={still} label={alt ?? media.alt} />;
  } else {
    content = (
      <Image
        className={styles.asset}
        src={media.url}
        alt={alt ?? media.alt}
        fill
        sizes={sizes}
        preload={preload}
        quality={quality}
        unoptimized={media.mimeType === "image/svg+xml"}
      />
    );
  }

  return (
    <div className={frameClass} style={frameStyle} data-reveal={reveal ? "image" : undefined}>
      {content}
    </div>
  );
}
