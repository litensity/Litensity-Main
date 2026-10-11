import Link from "next/link";
import type { CSSProperties } from "react";
import { getNavigation, getSiteSettings, getSocialLinks } from "@/lib/cms/site";
import { getBrands, getDownloadAvailability } from "@/lib/cms/brands";
import { present, telHref } from "@/lib/content";
import { CmsText } from "@/components/ui/CmsText";
import { Icon, hasIcon } from "@/components/ui/Icon";
import { NewsletterForm } from "@/components/forms/Forms";
import styles from "./Footer.module.css";

export async function Footer() {
  const [settings, nav, brands, social, available] = await Promise.all([
    getSiteSettings(),
    getNavigation(),
    getBrands(),
    getSocialLinks(),
    getDownloadAvailability(),
  ]);
  const groupSocial = social.filter((s) => !s.brandId);
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} data-source-section="Footer">
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.statement}>
            <Link href="/" className={styles.logo} aria-label={`${settings.companyName} — home`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/litensity-logo-reverse.png" alt="" width={738} height={159} loading="lazy" />
            </Link>
            <CmsText as="p" value={settings.footerStatement} className={styles.statementText} />
            {settings.newsletterEnabled && (
              <div className={styles.newsletter}>
                <CmsText as="p" value={settings.newsletterHeading} className={styles.newsletterHeading} />
                <NewsletterForm />
              </div>
            )}
          </div>

          <div className={styles.columns}>
            <nav aria-label="Footer" className={styles.col}>
              <p className={`label ${styles.colTitle}`}>Explore</p>
              <ul role="list">
                {nav.footerExplore.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={styles.link}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className={styles.col}>
              <p className={`label ${styles.colTitle}`}>Brands</p>
              <ul role="list" className={styles.brandList}>
                {brands.map((b) => {
                  const handles = social.filter((s) => s.brandId === b.id);
                  return (
                    <li key={b.id} style={{ "--dot": b.colors.primary } as CSSProperties}>
                      <Link href={`/brands/${b.slug}`} className={`${styles.link} ${styles.brandLink}`}>
                        {b.name}
                      </Link>
                      <div className={styles.brandMeta}>
                        {/* Every brand's menu is viewable on its page; the download (when published) sits beside it. */}
                        <Link href={`/brands/${b.slug}#menu`} className={styles.minor}>
                          Menu
                        </Link>
                        {available.get(b.id)?.has("brochure") && (
                          <Link href={`/brands/${b.slug}#downloads`} className={styles.minor}>
                            Brochure
                          </Link>
                        )}
                        {handles.map((h) => (
                          <a
                            key={h.url}
                            href={h.url}
                            className={styles.minor}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${b.name} on ${h.platform}`}
                          >
                            {hasIcon(h.platform.toLowerCase()) ? <Icon name={h.platform.toLowerCase()} size={16} /> : h.platform}
                          </a>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className={styles.col}>
              <p className={`label ${styles.colTitle}`}>Contact</p>
              <address className={styles.address}>
                <CmsText as="span" value={settings.legalName} className={styles.legalName} />
                <CmsText as="span" value={settings.address} />
              </address>
              <ul role="list" className={styles.contactList}>
                {settings.phone && (
                  <li>
                    <a href={telHref(settings.phone)} className={styles.link}>
                      {settings.phone}
                    </a>
                  </li>
                )}
                {settings.email && (
                  <li>
                    <a href={`mailto:${settings.email}`} className={styles.link}>
                      {settings.email}
                    </a>
                  </li>
                )}
              </ul>
              {groupSocial.length > 0 && (
                <ul role="list" className={styles.social}>
                  {groupSocial.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`Litensity on ${s.platform}`}>
                        {hasIcon(s.platform.toLowerCase()) ? <Icon name={s.platform.toLowerCase()} size={20} /> : s.platform}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>
            © {year} {present(settings.legalName) ?? settings.companyName}
          </p>
          <ul role="list" className={styles.legal}>
            {nav.footerLegal.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className={styles.giant} aria-hidden="true">
        {settings.companyName}
      </p>
    </footer>
  );
}
