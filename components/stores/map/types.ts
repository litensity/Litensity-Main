/*
 * Map provider contract. The locator only talks to this interface, so swapping
 * Leaflet/OSM for Google Maps (pending client decision) means writing one adapter.
 */

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  color: string;
  title: string;
  subtitle: string;
}

export interface MapViewProps {
  pins: MapPin[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  userLocation: { lat: number; lng: number } | null;
  /** Changes whenever the filtered set changes; the map refits to the pins. */
  fitKey: string;
  ariaLabel: string;
}
