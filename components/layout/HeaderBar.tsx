"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { CtaLink, NavItem } from "@/lib/cms/types";
import { telHref } from "@/lib/content";
import { Icon } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";
import styles from "./Header.module.css";

interface BrandLink {
  slug: string;
  name: string;
  color: string;
  tagline: string | null;
}

interface Props {
  items: NavItem[];
  enquire: CtaLink;
  companyName: string;
  logoUrl: string | null;
  brands: BrandLink[];
  contact: { phone: string | null; email: string | null };
}

export function HeaderBar({ items, enquire, companyName, logoUrl, brands, contact }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 24);
        // Hide while scrolling down; come back (compact) as soon as the visitor scrolls up.
        if (y > 240 && y > lastY.current + 4) setHidden(true);
        else if (y < lastY.current - 4 || y < 240) setHidden(false);
        lastY.current = y;
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lets the floating Enquire badge appear only while the header's own button is out of view.
  useEffect(() => {
    document.documentElement.toggleAttribute("data-header-away", hidden && !open);
  }, [hidden, open]);

  // Close the menu on navigation.
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const brandsHref = items.find((i) => i.href === "/brands")?.href;

  return (
    <>
      <header
        className={styles.header}
        data-scrolled={scrolled || undefined}
        data-compact={(scrolled && !open) || undefined}
        data-hidden={(hidden && !open) || undefined}
        data-open={open || undefined}
      >
        <div className={styles.bar}>
          <Link href="/" className={styles.logo} aria-label={`${companyName} — home`}>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" height={32} />
            ) : (
              <span className={styles.wordmark}>
                {companyName}
                <span className={styles.wordmarkDot} aria-hidden="true" />
              </span>
            )}
          </Link>

          <nav className={styles.nav} aria-label="Primary">
            <ul role="list" className={styles.navList}>
              {items.map((item) => (
                <li key={item.href} className={item.href === brandsHref ? styles.hasPanel : undefined}>
                  <Link
                    href={item.href}
                    className={styles.navLink}
                    aria-current={isActive(item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                  {item.href === brandsHref && brands.length > 0 && (
                    <div className={styles.panel}>
                      <ul role="list">
                        {brands.map((b) => (
                          <li key={b.slug}>
                            <Link
                              href={`/brands/${b.slug}`}
                              className={styles.panelLink}
                              style={{ "--dot": b.color } as CSSProperties}
                            >
                              <span className={styles.panelName}>{b.name}</span>
                              {b.tagline && <span className={styles.panelMeta}>{b.tagline}</span>}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.actions}>
            <ButtonLink href={enquire.href} className={styles.enquire} tone={open ? "paper" : "ink"}>
              {enquire.label}
            </ButtonLink>
            <button
              ref={toggleRef}
              type="button"
              className={styles.toggle}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              <span className={styles.toggleText}>{open ? "Close" : "Menu"}</span>
              <span className={styles.burger} aria-hidden="true">
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div id="mobile-menu" className={styles.menu} data-open={open || undefined} aria-hidden={!open} inert={!open}>
        <nav aria-label="Mobile" className={styles.menuInner}>
          <ul role="list" className={styles.menuList}>
            {items.map((item, i) => (
              <li key={item.href} style={{ "--i": i } as CSSProperties}>
                <Link href={item.href} className={styles.menuLink} aria-current={isActive(item.href) ? "page" : undefined}>
                  <span className={styles.menuIndex}>{String(i + 1).padStart(2, "0")}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          {brands.length > 0 && (
            <ul role="list" className={styles.menuBrands}>
              {brands.map((b) => (
                <li key={b.slug}>
                  <Link href={`/brands/${b.slug}`} style={{ "--dot": b.color } as CSSProperties}>
                    {b.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className={styles.menuFoot}>
            {contact.phone && (
              <a href={telHref(contact.phone)}>
                <Icon name="phone" size={18} /> {contact.phone}
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`}>
                <Icon name="mail" size={18} /> {contact.email}
              </a>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
