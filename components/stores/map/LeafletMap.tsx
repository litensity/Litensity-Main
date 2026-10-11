"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapViewProps } from "./types";
import styles from "./LeafletMap.module.css";

const TILE_URL = process.env.NEXT_PUBLIC_MAP_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION ??
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const INDIA_BOUNDS = L.latLngBounds([6.5, 68], [35.7, 97.5]);

function pinIcon(color: string, selected: boolean) {
  return L.divIcon({
    className: styles.pinWrap,
    html: `<span class="${styles.pin}${selected ? ` ${styles.selected}` : ""}" style="--c:${color}"></span>`,
    iconSize: [28, 36],
    iconAnchor: [14, 34],
    popupAnchor: [0, -30],
  });
}

function fitTo(m: L.Map, pins: { lat: number; lng: number }[]) {
  if (m.getSize().x === 0) return;
  if (pins.length === 0) m.flyToBounds(INDIA_BOUNDS, { duration: 0.8 });
  else if (pins.length === 1) m.flyTo([pins[0].lat, pins[0].lng], 14, { duration: 0.8 });
  else m.flyToBounds(L.latLngBounds(pins.map((p) => [p.lat, p.lng] as [number, number])), { padding: [48, 48], maxZoom: 13, duration: 0.8 });
}

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Leaflet adapter for the StoreMap contract. */
export default function LeafletMap({ pins, selectedId, onSelect, userLocation, fitKey, ariaLabel }: MapViewProps) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const markers = useRef(new Map<string, L.Marker>());
  const userMarker = useRef<L.CircleMarker | null>(null);
  const pinsRef = useRef(pins);

  useEffect(() => {
    if (!el.current || map.current) return;
    const m = L.map(el.current, {
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: true,
      maxBounds: INDIA_BOUNDS.pad(0.6),
      minZoom: 4,
    }).setView([22.5, 80], 4);
    L.control.zoom({ position: "bottomright" }).addTo(m);
    L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 19 }).addTo(m);
    // Scroll-zoom only after the visitor interacts, so the page scroll isn't hijacked.
    m.on("focus click", () => m.scrollWheelZoom.enable());
    m.on("blur mouseout", () => m.scrollWheelZoom.disable());
    layer.current = L.layerGroup().addTo(m);
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
    };
  }, []);

  // Rebuild markers when pins change.
  useEffect(() => {
    const group = layer.current;
    if (!group) return;
    group.clearLayers();
    markers.current.clear();
    for (const pin of pins) {
      const marker = L.marker([pin.lat, pin.lng], {
        icon: pinIcon(pin.color, pin.id === selectedId),
        title: pin.title,
        keyboard: true,
        riseOnHover: true,
      })
        .bindPopup(`<strong>${escape(pin.title)}</strong><br>${escape(pin.subtitle)}`, { closeButton: false, className: styles.popup })
        .on("click", () => onSelect(pin.id));
      marker.addTo(group);
      markers.current.set(pin.id, marker);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pins]);

  // Keep the latest pins for fits triggered by effects/observers.
  useEffect(() => {
    pinsRef.current = pins;
  });

  // Fit to the current result set (state / city / locality zoom).
  useEffect(() => {
    if (map.current) fitTo(map.current, pinsRef.current);
  }, [fitKey]);

  // Hidden containers (mobile list view) have no size; fit again once visible.
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    let wasHidden = node.offsetWidth === 0;
    const ro = new ResizeObserver(() => {
      const m = map.current;
      if (!m) return;
      m.invalidateSize();
      const hidden = node.offsetWidth === 0;
      if (wasHidden && !hidden) fitTo(m, pinsRef.current);
      wasHidden = hidden;
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  // Highlight + reveal the selected store.
  useEffect(() => {
    markers.current.forEach((marker, id) => {
      const pin = pins.find((p) => p.id === id);
      if (pin) marker.setIcon(pinIcon(pin.color, id === selectedId));
    });
    const marker = selectedId ? markers.current.get(selectedId) : null;
    if (marker && map.current && map.current.getSize().x > 0) {
      map.current.flyTo(marker.getLatLng(), Math.max(map.current.getZoom(), 14), { duration: 0.7 });
      marker.openPopup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    userMarker.current?.remove();
    if (userLocation) {
      userMarker.current = L.circleMarker([userLocation.lat, userLocation.lng], {
        radius: 8,
        color: "#fff",
        weight: 3,
        fillColor: "#2563eb",
        fillOpacity: 1,
      })
        .bindTooltip("You are here")
        .addTo(m);
    }
  }, [userLocation]);

  return <div ref={el} className={styles.map} role="region" aria-label={ariaLabel} />;
}
