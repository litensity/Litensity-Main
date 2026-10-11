import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { isExternal } from "@/lib/content";
import { Icon, type IconName } from "./Icon";
import styles from "./Button.module.css";

type Variant = "solid" | "outline" | "link";
type Tone = "ink" | "paper" | "brand" | "ember";

interface Common {
  children: ReactNode;
  variant?: Variant;
  tone?: Tone;
  icon?: IconName | null;
  size?: "md" | "lg";
  className?: string;
}

function classes({ variant = "solid", tone = "ink", size = "md", className }: Omit<Common, "children">) {
  return [styles.button, styles[variant], styles[tone], styles[size], className].filter(Boolean).join(" ");
}

/** Solid buttons are the primary actions: they get the magnetic nudge. */
const magnetic = (variant: Variant = "solid") => (variant === "solid" ? { "data-magnetic": "" } : {});

/** Label plus an arrow that slides out and back in from the left on hover. */
function Inner({ children, icon }: { children: ReactNode; icon?: IconName | null }) {
  const name = icon ?? "arrow";
  return (
    <>
      <span className={styles.label}>{children}</span>
      {icon !== null && (
        <span className={styles.icon}>
          <Icon name={name} size={18} className={styles.iconOut} />
          <Icon name={name} size={18} className={styles.iconIn} />
        </span>
      )}
    </>
  );
}

/** CTA link. Internal hrefs use next/link; external ones open in a new tab. */
export function ButtonLink({ href, children, icon, ...rest }: Common & { href: string }) {
  if (isExternal(href)) {
    const newTab = href.startsWith("http");
    return (
      <a
        href={href}
        className={classes(rest)}
        {...magnetic(rest.variant)}
        {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        <Inner icon={icon === undefined && newTab ? "arrow-up-right" : icon}>{children}</Inner>
      </a>
    );
  }
  return (
    <Link href={href} className={classes(rest)} {...magnetic(rest.variant)}>
      <Inner icon={icon}>{children}</Inner>
    </Link>
  );
}

export function Button({
  children,
  icon,
  variant,
  tone,
  size,
  className,
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={classes({ variant, tone, size, className })} {...magnetic(variant)} {...rest}>
      <Inner icon={icon}>{children}</Inner>
    </button>
  );
}
