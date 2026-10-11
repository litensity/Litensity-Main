"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Areas the floating Enquire badge must never cover. */
const AVOID = ["footer", "form", "[data-section='link_rows']", "[data-section='cta_band']", "[data-dock-avoid]"].join(",");

/**
 * Sets html[data-dock-avoid] while any of those areas is on screen, so the sticky
 * Enquire badge/bar can step aside instead of sitting on top of content.
 */
export function DockWatcher() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const visible = new Set<Element>();
    const sync = () => root.toggleAttribute("data-dock-avoid", visible.size > 0);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target);
          else visible.delete(e.target);
        }
        sync();
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    const observed = new Set<Element>();
    const scan = () =>
      document.querySelectorAll(AVOID).forEach((el) => {
        if (!observed.has(el)) {
          observed.add(el);
          io.observe(el);
        }
      });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      root.removeAttribute("data-dock-avoid");
    };
  }, [pathname]);

  return null;
}
