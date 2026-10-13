import type { CSSProperties } from "react";
import type { Person } from "@/lib/cms/types";
import { CmsText } from "@/components/ui/CmsText";
import { Media } from "@/components/ui/Media";
import { Icon } from "@/components/ui/Icon";
import { Tilt } from "@/components/ui/Tilt";
import styles from "./PersonCard.module.css";

/** Founder / leader portrait. Consistent 4:5 crop and duotone-to-colour treatment. */
export function PersonCard({ person, index = 0, detailed = false }: { person: Person; index?: number; detailed?: boolean }) {
  return (
    <article className={styles.card} data-reveal="up" style={{ "--i": index } as CSSProperties}>
      <Tilt max={6} className={styles.arch}>
        <div className={styles.portrait}>
          <Media media={person.photo} aspect="4 / 5" sizes="(min-width: 900px) 30vw, 80vw" hint="Portrait 4:5" alt={person.name} />
        </div>
      </Tilt>
      <div className={styles.text}>
        <h3 className={styles.name}>
          <CmsText value={person.name} />
        </h3>
        <CmsText as="p" value={person.designation} className={styles.role} />
        {detailed && (
          <div className={styles.detail}>
            <CmsText as="p" value={person.background} />
            <CmsText as="p" value={person.responsibility} />
            <CmsText as="p" value={person.bio} />
          </div>
        )}
        {(person.linkedinUrl || person.instagramUrl) && (
          <div className={styles.social}>
            {person.linkedinUrl && (
              <a
                href={person.linkedinUrl}
                className={styles.socialLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${person.name} on LinkedIn`}
              >
                <Icon name="linkedin" size={18} />
              </a>
            )}
            {person.instagramUrl && (
              <a
                href={person.instagramUrl}
                className={styles.socialLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${person.name} on Instagram`}
              >
                <Icon name="instagram" size={18} />
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
