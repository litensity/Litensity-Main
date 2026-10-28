"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Scroll-in-scroll: on desktop (motion allowed) the block pins to the viewport and vertical
 * scrolling slides the track sideways until its end is in view, then the page carries on.
 * The pinned distance follows the track's width, so adding items simply lengthens the ride.
 * Elsewhere the CSS leaves the track as a plain swipeable row (overflow-x).
 * Styling hooks: `[data-pinned]` on the outer element while pinning is active.
 */
export function PinnedScroll({
  head,
  children,
  className,
  stickyClassName,
  trackClassName,
  label,
}: {
  head?: ReactNode;
  children: ReactNode;
  className?: string;
  stickyClassName?: string;
  trackClassName?: string;
  label?: string;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const sticky = stickyRef.current;
    const track = trackRef.current;
    if (!outer || !sticky || !track) return;
    const motion = window.matchMedia("(min-width: 900px) and (prefers-reduced-motion: no-preference)");
    let distance = 0;
    let frame = 0;

    const update = () => {
      frame = 0;
      if (!distance) return;
      const progress = Math.min(1, Math.max(0, -outer.getBoundingClientRect().top / distance));
      track.style.transform = `translate3d(${(-progress * distance).toFixed(1)}px, 0, 0)`;
    };

    const measure = () => {
      outer.removeAttribute("data-pinned");
      outer.style.removeProperty("height");
      track.style.removeProperty("transform");
      distance = motion.matches ? Math.max(0, track.scrollWidth - track.clientWidth) : 0;
      if (distance < 8) {
        distance = 0;
        return;
      }
      outer.setAttribute("data-pinned", "");
      // The pinned panel stays put while the page scrolls `distance` pixels past it.
      outer.style.height = `${sticky.offsetHeight + distance}px`;
      update();
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    // Re-measure when the cards change size (fonts, images, admin edits), not the pinned panel itself.
    const observer = new ResizeObserver(() => measure());
    Array.from(track.children).forEach((c) => observer.observe(c));
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    motion.addEventListener("change", measure);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      motion.removeEventListener("change", measure);
    };
  }, []);

  return (
    <div ref={outerRef} className={className}>
      <div ref={stickyRef} className={stickyClassName}>
        {head}
        <ol ref={trackRef} role="list" className={trackClassName} aria-label={label} tabIndex={0}>
          {children}
        </ol>
      </div>
    </div>
  );
}
