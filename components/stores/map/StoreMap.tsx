"use client";

import dynamic from "next/dynamic";
import type { MapViewProps } from "./types";

/**
 * Provider-neutral map entry point. Loads the active adapter lazily on the client
 * (Leaflet today). To switch providers, point this import at a new adapter.
 */
const Adapter = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <div style={{ width: "100%", height: "100%", background: "var(--paper-2)" }} aria-hidden="true" />,
});

export function StoreMap(props: MapViewProps) {
  return <Adapter {...props} />;
}

export type { MapPin } from "./types";
