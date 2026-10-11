"use client";

import { StoreMap } from "./map/StoreMap";

interface Props {
  lat: number;
  lng: number;
  title: string;
  subtitle: string;
}

/** Corporate office on the shared, provider-neutral map (brief p.20: contact page address and map). */
export function OfficeMap({ lat, lng, title, subtitle }: Props) {
  return (
    <StoreMap
      pins={[{ id: "office", lat, lng, color: "var(--ember)", title, subtitle }]}
      selectedId={null}
      onSelect={() => {}}
      userLocation={null}
      fitKey="office"
      ariaLabel={`Map showing ${title}`}
    />
  );
}
