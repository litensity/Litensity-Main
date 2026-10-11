import Link from "next/link";
import { getSiteSettings } from "@/lib/cms/site";
import { telHref, whatsappHref } from "@/lib/content";
import { Icon } from "@/components/ui/Icon";
import { DockWatcher } from "./DockWatcher";
import styles from "./EnquireDock.module.css";

/**
 * Sticky Enquire on every page. Desktop: a rotating badge that only appears while the
 * header (and its Enquire button) is scrolled away. Mobile: a thumb-reach action bar with
 * click-to-call and WhatsApp. Both step aside over the footer, forms and closing link rows.
 */
export async function EnquireDock() {
  const settings = await getSiteSettings();
  const { enquire, phone, whatsappNumber, whatsappMessage } = settings;
  const ring = `${enquire.label} · ${enquire.label} · ${enquire.label} · `;

  return (
    <>
      <DockWatcher />
      <Link href={enquire.href} className={styles.badge} aria-label={enquire.label}>
        <svg viewBox="0 0 100 100" className={styles.ring} aria-hidden="true">
          <defs>
            <path id="enquire-ring" d="M50 50m-38 0a38 38 0 1 1 76 0a38 38 0 1 1-76 0" />
          </defs>
          <text>
            <textPath href="#enquire-ring" textLength="236">
              {ring.toUpperCase()}
            </textPath>
          </text>
        </svg>
        <span className={styles.core}>
          <Icon name="arrow-up-right" size={22} />
        </span>
      </Link>

      <nav className={styles.bar} aria-label="Quick actions">
        {phone && (
          <a href={telHref(phone)} className={styles.action}>
            <Icon name="phone" size={18} />
            <span>Call</span>
          </a>
        )}
        {whatsappNumber && (
          <a
            href={whatsappHref(whatsappNumber, whatsappMessage)}
            className={styles.action}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="whatsapp" size={18} />
            <span>WhatsApp</span>
          </a>
        )}
        <Link href={enquire.href} className={`${styles.action} ${styles.primary}`}>
          <span>{enquire.label}</span>
          <Icon name="arrow" size={18} />
        </Link>
      </nav>
    </>
  );
}
