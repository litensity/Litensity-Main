import type { CSSProperties } from "react";
import type { Store } from "@/lib/cms/types";
import { directionsUrl, summariseHours } from "@/lib/stores";
import { telHref } from "@/lib/content";
import { Icon } from "@/components/ui/Icon";
import { Media } from "@/components/ui/Media";
import { OpenNow } from "./OpenNow";
import styles from "./StoreCard.module.css";

interface Props {
  store: Store;
  showBrand?: boolean;
  distanceKm?: number | null;
  selected?: boolean;
  onSelect?: () => void;
  showPhoto?: boolean;
}

/** Store card: name, address, hours, call, directions, order links, optional photo. */
export function StoreCard({ store, showBrand = true, distanceKm, selected, onSelect, showPhoto = true }: Props) {
  const hours = summariseHours(store.hours);
  return (
    <article
      className={styles.card}
      data-selected={selected || undefined}
      style={{ "--c": store.brand.color } as CSSProperties}
      aria-label={`${store.brand.name} — ${store.name}`}
    >
      {showPhoto && store.photo && (
        <div className={styles.photo}>
          <Media media={store.photo} aspect="16 / 9" sizes="(min-width: 900px) 30vw, 90vw" />
        </div>
      )}
      <header className={styles.head}>
        {showBrand && <span className={styles.brand}>{store.brand.name}</span>}
        {store.status === "opening_soon" ? (
          <span className={styles.soon}>Opening soon</span>
        ) : (
          <OpenNow hours={store.hours} />
        )}
      </header>

      <h3 className={styles.name}>
        {onSelect ? (
          <button type="button" onClick={onSelect} className={styles.nameButton}>
            {store.name}
          </button>
        ) : (
          store.name
        )}
      </h3>

      <address className={styles.address}>
        {store.address}
        <br />
        {[store.locality, store.city].filter(Boolean).join(", ")} {store.pincode}
        {typeof distanceKm === "number" && <span className={styles.distance}> · {distanceKm < 10 ? distanceKm.toFixed(1) : Math.round(distanceKm)} km away</span>}
      </address>

      {(hours.length > 0 || store.hoursNote) && (
        <dl className={styles.hours}>
          {hours.map((h) => (
            <div key={h.days}>
              <dt>{h.days}</dt>
              <dd>{h.range}</dd>
            </div>
          ))}
          {store.hoursNote && <p className={styles.note}>{store.hoursNote}</p>}
        </dl>
      )}

      {store.status === "live" && (
        <div className={styles.actions}>
          {/\d/.test(store.phone) && (
            <a href={telHref(store.phone)} className={styles.action}>
              <Icon name="phone" size={16} /> Call
            </a>
          )}
          <a href={directionsUrl(store)} target="_blank" rel="noopener noreferrer" className={styles.action}>
            <Icon name="directions" size={16} /> Directions
          </a>
          {store.orderLinks.map((link) => (
            <a key={link.url + link.platform} href={link.url} target="_blank" rel="noopener noreferrer" className={`${styles.action} ${styles.order}`}>
              {link.platform} <Icon name="arrow-up-right" size={14} />
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
