"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import styles from "./Media.module.css";

/**
 * Muted ambient loop. Plays only while on screen, never autoplays for reduced-motion
 * visitors (the poster shows instead) and always offers a pause control.
 */
export function LoopVideo({ src, poster, label, className }: { src: string; poster?: string; label: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  // Mirrors the element's own play/pause events, so it is right whatever started or stopped playback.
  const [paused, setPaused] = useState(true);
  const userPaused = useRef(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    // Reduced-motion visitors keep the poster until they press play.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      userPaused.current = true;
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !userPaused.current) video.play().catch(() => undefined);
        else video.pause();
      },
      { threshold: 0.15 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      userPaused.current = false;
      video.play().catch(() => undefined);
    } else {
      userPaused.current = true;
      video.pause();
    }
  };

  return (
    <>
      <video
        ref={ref}
        className={[styles.asset, className].filter(Boolean).join(" ")}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
      />
      <button type="button" className={styles.videoToggle} onClick={toggle} aria-label={paused ? "Play film" : "Pause film"}>
        <Icon name={paused ? "play" : "pause"} size={16} />
      </button>
    </>
  );
}
