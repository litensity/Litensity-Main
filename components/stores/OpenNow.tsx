"use client";

import { useSyncExternalStore } from "react";
import type { StoreHours } from "@/lib/cms/types";
import { isOpenNow } from "@/lib/stores";
import styles from "./StoreCard.module.css";

const subscribe = (cb: () => void) => {
  const t = setInterval(cb, 60_000);
  return () => clearInterval(t);
};

/** Client-only "Open now" badge (time-dependent, so never server-rendered). */
export function OpenNow({ hours }: { hours: StoreHours[] }) {
  const open = useSyncExternalStore(
    subscribe,
    () => isOpenNow(hours),
    () => null,
  );
  if (open === null) return null;
  return <span className={open ? styles.open : styles.closed}>{open ? "Open now" : "Closed now"}</span>;
}
