"use client";

import { useMemo, useState, type CSSProperties } from "react";
import type { Store } from "@/lib/cms/types";
import { distanceKm, storeMatchesQuery } from "@/lib/stores";
import { Icon } from "@/components/ui/Icon";
import { StoreMap, type MapPin } from "./map/StoreMap";
import { StoreCard } from "./StoreCard";
import styles from "./StoreLocator.module.css";

interface BrandOption {
  slug: string;
  name: string;
  color: string;
}

interface Props {
  stores: Store[];
  brands: BrandOption[];
  initialBrand?: string | null;
  initialState?: string | null;
  initialCity?: string | null;
  /** Brand pages: the locator is pre-filtered and the brand filter is hidden. */
  lockBrand?: boolean;
  /** Keep ?brand=&state=&city= in the URL in sync (full locator page only). */
  syncUrl?: boolean;
  headingId?: string;
}

type GeoState = { status: "idle" | "locating" | "denied" | "error" } | { status: "ok"; lat: number; lng: number };

const uniqueSorted = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b));

export function StoreLocator({ stores, brands, initialBrand = null, initialState = null, initialCity = null, lockBrand, syncUrl, headingId }: Props) {
  const [brand, setBrand] = useState<string | null>(initialBrand);
  const [state, setState] = useState<string | null>(initialState);
  const [city, setCity] = useState<string | null>(initialCity);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [geo, setGeo] = useState<GeoState>({ status: "idle" });
  const [view, setView] = useState<"list" | "map">("list");

  const live = useMemo(() => stores.filter((s) => s.status === "live"), [stores]);
  const soon = useMemo(() => stores.filter((s) => s.status === "opening_soon"), [stores]);

  // Each filter's options are counted against the *other* active filters.
  const matches = (s: Store, skip?: "brand" | "state" | "city") =>
    (skip === "brand" || !brand || s.brand.slug === brand) &&
    (skip === "state" || !state || s.state === state) &&
    (skip === "city" || !city || s.city === city) &&
    storeMatchesQuery(s, query);

  const results = useMemo(() => {
    const filtered = live.filter((s) => matches(s));
    if (geo.status !== "ok") return filtered.map((s) => ({ store: s, km: null as number | null }));
    return filtered
      .map((s) => ({ store: s, km: distanceKm(geo, { lat: s.latitude, lng: s.longitude }) }))
      .sort((a, b) => a.km - b.km);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, brand, state, city, query, geo]);

  // Opening-soon stores have no pin, but they follow the same brand/state/city/search filters.
  const upcoming = soon.filter((s) => matches(s));

  const brandCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of live) if (matches(s, "brand")) counts.set(s.brand.slug, (counts.get(s.brand.slug) ?? 0) + 1);
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, state, city, query]);

  const stateOptions = useMemo(() => {
    const pool = live.filter((s) => matches(s, "state"));
    return uniqueSorted(live.map((s) => s.state)).map((name) => ({ name, count: pool.filter((s) => s.state === name).length }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, brand, city, query]);

  const cityOptions = useMemo(() => {
    const pool = live.filter((s) => matches(s, "city"));
    const inState = state ? live.filter((s) => s.state === state) : live;
    return uniqueSorted(inState.map((s) => s.city)).map((name) => ({ name, count: pool.filter((s) => s.city === name).length }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, brand, state, query]);

  const pins: MapPin[] = useMemo(
    () =>
      results.map(({ store }) => ({
        id: store.id,
        lat: store.latitude,
        lng: store.longitude,
        color: store.brand.color,
        title: `${store.brand.name} — ${store.name}`,
        subtitle: `${store.locality ? `${store.locality}, ` : ""}${store.city}`,
      })),
    [results],
  );
  const fitKey = `${brand}|${state}|${city}|${query}|${geo.status}`;

  // City-wise grouping for the list (nearest-first ignores grouping).
  const groups = useMemo(() => {
    if (geo.status === "ok") return [{ city: "Nearest to you", items: results }];
    const map = new Map<string, typeof results>();
    for (const r of results) {
      const key = `${r.store.city}, ${r.store.state}`;
      map.set(key, [...(map.get(key) ?? []), r]);
    }
    return [...map.entries()].map(([city, items]) => ({ city, items }));
  }, [results, geo.status]);

  function updateUrl(next: { brand?: string | null; state?: string | null; city?: string | null }) {
    if (!syncUrl) return;
    const params = new URLSearchParams(window.location.search);
    for (const [k, v] of Object.entries(next)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    const qs = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  }

  function chooseBrand(slug: string | null) {
    setBrand(slug);
    setSelectedId(null);
    updateUrl({ brand: slug });
  }
  function chooseState(value: string | null) {
    setState(value);
    setCity(null);
    setSelectedId(null);
    updateUrl({ state: value, city: null });
  }
  function chooseCity(value: string | null) {
    setCity(value);
    setSelectedId(null);
    updateUrl({ city: value });
  }

  function locate() {
    if (!("geolocation" in navigator)) {
      setGeo({ status: "error" });
      return;
    }
    setGeo({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) => setGeo({ status: "ok", lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setGeo({ status: err.code === err.PERMISSION_DENIED ? "denied" : "error" }),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }

  function reset() {
    setBrand(lockBrand ? initialBrand : null);
    setState(null);
    setCity(null);
    setQuery("");
    setSelectedId(null);
    setGeo({ status: "idle" });
    updateUrl({ brand: lockBrand ? initialBrand : null, state: null, city: null });
  }

  const filtersActive = (!lockBrand && brand) || state || city || query || geo.status === "ok";

  return (
    <div className={styles.locator} data-view={view}>
      <div className={styles.controls} role="search" aria-label="Find a store">
        <div className={styles.searchRow}>
          <label className={styles.search}>
            <Icon name="search" size={18} />
            <span className="sr-only">Search by pincode or locality</span>
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedId(null);
              }}
              placeholder="Pincode or locality"
              inputMode="search"
              autoComplete="postal-code"
            />
          </label>
          <button type="button" className={styles.locate} onClick={locate} data-active={geo.status === "ok" || undefined} disabled={geo.status === "locating"}>
            <Icon name="locate" size={18} />
            <span>{geo.status === "locating" ? "Locating…" : geo.status === "ok" ? "Nearest first" : "Use my location"}</span>
          </button>
        </div>

        {!lockBrand && brands.length > 1 && (
          <div className={styles.chips} role="group" aria-label="Filter by brand">
            <button type="button" className={styles.chip} aria-pressed={!brand} onClick={() => chooseBrand(null)}>
              All brands
            </button>
            {brands.map((b) => (
              <button
                key={b.slug}
                type="button"
                className={styles.chip}
                aria-pressed={brand === b.slug}
                onClick={() => chooseBrand(brand === b.slug ? null : b.slug)}
                style={{ "--c": b.color } as CSSProperties}
              >
                <span className={styles.dot} aria-hidden="true" />
                {b.name}
                <span className={styles.count}>{brandCounts.get(b.slug) ?? 0}</span>
              </button>
            ))}
          </div>
        )}

        <div className={styles.selects}>
          <label className={styles.select}>
            <span className="label">State</span>
            <select value={state ?? ""} onChange={(e) => chooseState(e.target.value || null)}>
              <option value="">All states</option>
              {stateOptions.map((o) => (
                <option key={o.name} value={o.name} disabled={o.count === 0 && o.name !== state}>
                  {o.name} ({o.count})
                </option>
              ))}
            </select>
          </label>
          <label className={styles.select}>
            <span className="label">City</span>
            <select value={city ?? ""} onChange={(e) => chooseCity(e.target.value || null)}>
              <option value="">All cities</option>
              {cityOptions.map((o) => (
                <option key={o.name} value={o.name} disabled={o.count === 0 && o.name !== city}>
                  {o.name} ({o.count})
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.summary}>
          <p aria-live="polite" id={headingId}>
            <strong>{results.length}</strong> {results.length === 1 ? "store" : "stores"}
            {city ? ` in ${city}` : state ? ` in ${state}` : ""}
          </p>
          {filtersActive && (
            <button type="button" className={styles.reset} onClick={reset}>
              Clear filters
            </button>
          )}
          <div className={styles.viewToggle} role="group" aria-label="View">
            <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")}>
              List
            </button>
            <button type="button" aria-pressed={view === "map"} onClick={() => setView("map")}>
              Map
            </button>
          </div>
        </div>
        {(geo.status === "denied" || geo.status === "error") && (
          <p className={styles.geoNote}>
            {geo.status === "denied"
              ? "Location permission was declined — search by pincode or choose a city instead."
              : "We couldn't get your location — search by pincode or choose a city instead."}
          </p>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.mapPane}>
          <StoreMap
            pins={pins}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id);
              document.getElementById(`store-${id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }}
            userLocation={geo.status === "ok" ? { lat: geo.lat, lng: geo.lng } : null}
            fitKey={fitKey}
            ariaLabel="Store map"
          />
        </div>
        {view === "map" && selectedId && (
          <div className={styles.mobileSelected}>
            {results
              .filter((r) => r.store.id === selectedId)
              .map(({ store, km }) => (
                <StoreCard key={store.id} store={store} showBrand={!lockBrand} distanceKm={km} selected />
              ))}
          </div>
        )}

        <div className={styles.listPane}>
          {results.length === 0 ? (
            <div className={styles.empty}>
              <p>No stores match those filters yet.</p>
              <button type="button" className={styles.reset} onClick={reset}>
                Show all stores
              </button>
            </div>
          ) : (
            groups.map((group) => (
              <section key={group.city} className={styles.group} aria-label={group.city}>
                <h3 className={styles.groupTitle}>
                  {group.city} <span>{group.items.length}</span>
                </h3>
                {group.items.map(({ store, km }) => (
                  <div key={store.id} id={`store-${store.id}`}>
                    <StoreCard
                      store={store}
                      showBrand={!lockBrand}
                      distanceKm={km}
                      selected={selectedId === store.id}
                      onSelect={() => {
                        setSelectedId(store.id);
                        if (window.matchMedia("(max-width: 899px)").matches) setView("map");
                      }}
                    />
                  </div>
                ))}
              </section>
            ))
          )}

          {upcoming.length > 0 && (
            <section className={styles.group} aria-label="Opening soon">
              <h3 className={styles.groupTitle}>Opening soon</h3>
              {upcoming.map((s) => (
                <StoreCard key={s.id} store={s} showBrand={!lockBrand} showPhoto={false} />
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
