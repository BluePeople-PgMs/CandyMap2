"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import L from "leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import { LeafletContext, createLeafletContext, type LeafletContextInterface } from "@react-leaflet/core";
import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import { setWorkerUrl } from "maplibre-gl";
import { CircleMarker, Marker, ZoomControl, useMap, useMapEvents } from "react-leaflet";
import { DEMO_MAP_CENTER, getNeighborhoodById } from "@/data";
import {
  demoHousePositionsForFit,
  getMapHouses,
  isWithinRadius,
  MAP_FIT_PADDING_OPTIONS,
  MAP_ZOOM,
  PINNED_NEIGHBORHOOD_ID,
  readSavedMapView,
  subscribeMapHouses,
  writeSavedMapView,
} from "@/lib";
import type { CandyTag, House } from "@/types";
import { AddHouseSheet } from "@/components/map/AddHouseSheet";
import { HousePreviewSheet } from "@/components/map/HousePreviewSheet";
import { createDraftMarkerIcon, createHouseMarkerIcon } from "@/components/map/markers";
import "leaflet/dist/leaflet.css";
import "maplibre-gl/dist/maplibre-gl.css";
import "@/components/map/map.css";

/**
 * CARTO's raster Dark Matter tiles started requiring an API key on 25 Sept 2026.
 * OpenFreeMap's "dark" style is that same open-source Dark Matter look, with no key.
 * Attribution is copied from the style onto the map.
 */
const DARK_MATTER_STYLE = "https://tiles.openfreemap.org/styles/dark";

// Kept in /public so the browser can start MapLibre's background worker.
// Replace this file if the maplibre-gl version changes.
const MAPLIBRE_WORKER_URL = "/maplibre-gl-worker.mjs";

const DEMO_CENTER: [number, number] = [DEMO_MAP_CENTER.lat, DEMO_MAP_CENTER.lng];
const LOCATION_FIT_RADIUS_METERS = 20_000;

type DraftPin = {
  lat: number;
  lng: number;
};

type MapNotice = {
  message: string;
};

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type MapRecord = {
  context: LeafletContextInterface;
};

type MapStore = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => MapRecord | null;
  set: (next: MapRecord | null) => void;
};

function createMapStore(): MapStore {
  let record: MapRecord | null = null;
  const listeners = new Set<() => void>();

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      return record;
    },
    set(next) {
      record = next;
      listeners.forEach((listener) => listener());
    },
  };
}

function emptyMapSnapshot(): null {
  return null;
}

/**
 * Leaflet's React wrapper can throw "already initialized" when a page is left
 * and opened again. This container creates and destroys the map in one effect,
 * and keeps React children outside the map div so they do not fight Leaflet's DOM.
 */
function LeafletMapView({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [store] = useState(createMapStore);
  const record = useSyncExternalStore(store.subscribe, store.getSnapshot, emptyMapSnapshot);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    const dirty = node as HTMLDivElement & { _leaflet_id?: number };
    if (dirty._leaflet_id != null) {
      delete dirty._leaflet_id;
    }

    const savedView = readSavedMapView();
    const map = L.map(node, {
      center: savedView ? [savedView.lat, savedView.lng] : DEMO_CENTER,
      zoom: savedView?.zoom ?? DEMO_MAP_CENTER.zoom,
      minZoom: MAP_ZOOM.min,
      maxZoom: MAP_ZOOM.max,
      zoomControl: false,
      attributionControl: true,
      worldCopyJump: true,
    });
    map.invalidateSize();

    const persistView = () => {
      const center = map.getCenter();
      writeSavedMapView({
        lat: center.lat,
        lng: center.lng,
        zoom: map.getZoom(),
      });
    };
    map.on("moveend", persistView);
    store.set({ context: createLeafletContext(map) });

    return () => {
      map.off("moveend", persistView);
      map.remove();
      store.set(null);
    };
  }, [store]);

  return (
    <>
      <div
        ref={containerRef}
        className="candy-leaflet h-full w-full"
        style={{ height: "100%", width: "100%", background: "#050308" }}
      />
      {record ? <LeafletContext value={record.context}>{children}</LeafletContext> : null}
    </>
  );
}

function DarkBasemap({
  tileVersion,
  onStatus,
}: {
  tileVersion: number;
  onStatus: (ok: boolean) => void;
}) {
  const map = useMap();

  useEffect(() => {
    let settled = false;
    const timer = window.setTimeout(() => {
      if (!settled) {
        settled = true;
        onStatus(false);
      }
    }, 8000);

    let layer: ReturnType<typeof maplibreGL>;
    try {
      setWorkerUrl(MAPLIBRE_WORKER_URL);
      layer = maplibreGL({ style: DARK_MATTER_STYLE });
      layer.addTo(map);
    } catch {
      return () => window.clearTimeout(timer);
    }

    const glMap = layer.getMaplibreMap();

    const succeed = () => {
      settled = true;
      onStatus(true);
    };

    const fail = (event: { error?: { message?: string } }) => {
      const message = event.error?.message ?? "";
      const styleFailed = /style|sprite|glyph|worker|Failed to fetch|WebGL/i.test(message);
      if (!settled && styleFailed) {
        settled = true;
        onStatus(false);
      }
    };

    glMap.on("load", succeed);
    glMap.on("error", fail);

    return () => {
      window.clearTimeout(timer);
      try {
        glMap.off("load", succeed);
        glMap.off("error", fail);
        map.removeLayer(layer);
      } catch {
        // Navigation can remove the map before this layer finishes cleaning up.
      }
    };
  }, [map, tileVersion, onStatus]);

  return null;
}

function MapInteractions({
  recenterToken,
  selectedHouse,
  draft,
  savedSpot,
  fitUserToken,
  userLocation,
  houses,
  onPlacePin,
  ignoreMapClickRef,
}: {
  recenterToken: number;
  selectedHouse: House | null;
  draft: DraftPin | null;
  savedSpot: DraftPin | null;
  fitUserToken: number;
  userLocation: { lat: number; lng: number } | null;
  houses: readonly House[];
  onPlacePin: (lat: number, lng: number) => void;
  ignoreMapClickRef: RefObject<boolean>;
}) {
  const map = useMap();

  useMapEvents({
    click(event) {
      if (ignoreMapClickRef.current) {
        ignoreMapClickRef.current = false;
        return;
      }
      const wrapped = event.latlng.wrap();
      onPlacePin(wrapped.lat, wrapped.lng);
    },
  });

  useEffect(() => {
    const onResize = () => map.invalidateSize();
    map.invalidateSize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [map]);

  useEffect(() => {
    if (recenterToken === 0) {
      return;
    }

    const animate = !prefersReducedMotion();
    const positions = demoHousePositionsForFit(
      houses,
      DEMO_MAP_CENTER,
      LOCATION_FIT_RADIUS_METERS,
    );
    if (positions.length === 0) {
      map.setView(DEMO_CENTER, DEMO_MAP_CENTER.zoom, { animate });
      return;
    }

    map.fitBounds(positions as LatLngBoundsExpression, {
      ...MAP_FIT_PADDING_OPTIONS,
      maxZoom: DEMO_MAP_CENTER.zoom,
      animate,
    });
  }, [recenterToken, houses, map]);

  const focusKey = selectedHouse
    ? selectedHouse.id
    : draft
      ? `draft:${draft.lat},${draft.lng}`
      : savedSpot
        ? `saved:${savedSpot.lat},${savedSpot.lng}`
        : "";
  const focusLat = selectedHouse?.lat ?? draft?.lat ?? savedSpot?.lat;
  const focusLng = selectedHouse?.lng ?? draft?.lng ?? savedSpot?.lng;
  const focusShift = draft || selectedHouse ? 0.18 : 0;

  useEffect(() => {
    if (focusKey === "" || focusLat == null || focusLng == null) {
      return;
    }

    const zoom = map.getZoom();
    const projected = map.project([focusLat, focusLng], zoom);
    const shift = Math.round(map.getSize().y * focusShift);
    map.panTo(map.unproject(projected.add([0, shift]), zoom), {
      animate: !prefersReducedMotion(),
    });
  }, [focusKey, focusLat, focusLng, focusShift, map]);

  useEffect(() => {
    if (fitUserToken === 0 || !userLocation || houses.length === 0) {
      return;
    }

    const bounds = demoHousePositionsForFit(
      houses,
      DEMO_MAP_CENTER,
      LOCATION_FIT_RADIUS_METERS,
    );
    if (bounds.length === 0) {
      return;
    }
    bounds.push([userLocation.lat, userLocation.lng]);
    map.fitBounds(bounds as LatLngBoundsExpression, {
      ...MAP_FIT_PADDING_OPTIONS,
      maxZoom: DEMO_MAP_CENTER.zoom,
      animate: !prefersReducedMotion(),
    });
  }, [fitUserToken, userLocation, houses, map]);

  return null;
}

function MapControlButton({
  label,
  pressed,
  busy,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  busy?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      aria-busy={busy}
      disabled={busy}
      onClick={onClick}
      className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-candy-orange/40 bg-candy-black/92 text-candy-orange shadow-lg backdrop-blur-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candy-orange disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function markerPlace(neighborhoodId: string): string {
  if (neighborhoodId === PINNED_NEIGHBORHOOD_ID) {
    return "Pinned location";
  }

  return getNeighborhoodById(neighborhoodId)?.name ?? "Pinned location";
}

export default function CandyMapCanvas() {
  const houses = useSyncExternalStore(subscribeMapHouses, getMapHouses, getMapHouses);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftPin | null>(null);
  const [savedSpot, setSavedSpot] = useState<DraftPin | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const successTimer = useRef<number | null>(null);
  const [notice, setNotice] = useState<MapNotice | null>(null);
  const [tilesOk, setTilesOk] = useState<boolean | null>(null);
  const [tileVersion, setTileVersion] = useState(0);
  const [recenterToken, setRecenterToken] = useState(0);
  const [fitUserToken, setFitUserToken] = useState(0);
  const [locating, setLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const ignoreMapClickRef = useRef(false);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      if (successTimer.current !== null) {
        window.clearTimeout(successTimer.current);
      }
    };
  }, []);

  const selectedHouse = houses.find((house) => house.id === selectedId) ?? null;

  const icons = useMemo(() => {
    const next = new Map<string, ReturnType<typeof createHouseMarkerIcon>>();
    for (const house of houses) {
      next.set(house.id, createHouseMarkerIcon(house, house.id === selectedId));
    }
    return next;
  }, [houses, selectedId]);

  const draftIcon = useMemo(() => createDraftMarkerIcon(), []);

  const onTileStatus = useCallback((ok: boolean) => {
    setTilesOk((current) => (current === ok ? current : ok));
  }, []);

  const onPlacePin = useCallback((lat: number, lng: number) => {
    setSelectedId(null);
    setSavedSpot(null);
    setSaveError(null);
    setDraft({ lat, lng });
  }, []);

  const selectHouse = (id: string) => {
    ignoreMapClickRef.current = true;
    window.setTimeout(() => {
      ignoreMapClickRef.current = false;
    }, 0);
    setDraft(null);
    setSavedSpot(null);
    setSaveError(null);
    setSelectedId((current) => (current === id ? null : id));
  };

  const cancelDraft = useCallback(() => {
    setDraft(null);
    setSaveError(null);
  }, []);

  const saveDraft = (input: {
    streetNumber: string;
    streetName: string;
    candyTags: CandyTag[];
    stars: number;
  }) => {
    if (!draft || input.stars < 0) {
      return;
    }

    setSaveError("Could not save this house. Try again later.");
  };

  const resetMapView = () => {
    setSelectedId(null);
    setDraft(null);
    setSavedSpot(null);
    setSaveError(null);
    setNotice(null);
    setRecenterToken((value) => value + 1);
  };

  const retryTiles = () => {
    setTilesOk(null);
    setTileVersion((value) => value + 1);
  };

  const locate = () => {
    if (!window.isSecureContext) {
      setNotice({
        message:
          "Location needs a secure connection. Open CandyMap over HTTPS. The map stays on the demo houses.",
      });
      return;
    }

    if (!("geolocation" in navigator)) {
      setNotice({
        message: "This browser cannot share your location. The map stays on the demo houses.",
      });
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!aliveRef.current) {
          return;
        }

        setLocating(false);
        const here = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (isWithinRadius(here.lat, here.lng, DEMO_MAP_CENTER)) {
          setUserLocation(here);
          setFitUserToken((value) => value + 1);
          setNotice({
            message: "You are near the demo. Your spot is marked, and the houses stay on screen.",
          });
          return;
        }

        setUserLocation(null);
        setNotice({
          message: "You are away from the Willow Grove demo, so the map stays on those houses.",
        });
      },
      (error) => {
        if (!aliveRef.current) {
          return;
        }

        setLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setNotice({
            message:
              "Location is turned off. On iPhone, allow Location for Safari or CandyMap in Settings. The map stays on the Willow Grove demo.",
          });
          return;
        }

        if (error.code === error.TIMEOUT) {
          setNotice({
            message: "Location took too long. The map stays on the demo houses.",
          });
          return;
        }

        setNotice({
          message: "We could not read your location. The map stays on the demo houses.",
        });
      },
      // The iPhone permission prompt counts toward this timer, so keep it generous.
      { enableHighAccuracy: false, timeout: 20_000, maximumAge: 60_000 },
    );
  };

  return (
    <div className="absolute inset-0">
      <LeafletMapView>
        <DarkBasemap tileVersion={tileVersion} onStatus={onTileStatus} />
        <ZoomControl position="topleft" />
        <MapInteractions
          recenterToken={recenterToken}
          selectedHouse={selectedHouse}
          draft={draft}
          savedSpot={savedSpot}
          fitUserToken={fitUserToken}
          userLocation={userLocation}
          houses={houses}
          onPlacePin={onPlacePin}
          ignoreMapClickRef={ignoreMapClickRef}
        />
        {houses.map((house) => {
          const neighborhood = markerPlace(house.neighborhoodId);
          const icon = icons.get(house.id);
          if (!icon) {
            return null;
          }

          return (
            <Marker
              key={house.id}
              position={[house.lat, house.lng]}
              icon={icon}
              title={`${house.name}, ${neighborhood}`}
              zIndexOffset={house.id === selectedId ? 1000 : 0}
              keyboard
              eventHandlers={{ click: () => selectHouse(house.id) }}
            />
          );
        })}
        {draft ? (
          <Marker
            position={[draft.lat, draft.lng]}
            icon={draftIcon}
            interactive={false}
            keyboard={false}
            zIndexOffset={1100}
            title="New house"
          />
        ) : null}
        {userLocation ? (
          <CircleMarker
            center={[userLocation.lat, userLocation.lng]}
            radius={8}
            pathOptions={{
              color: "#ff7a18",
              weight: 3,
              fillColor: "#f4e9d8",
              fillOpacity: 1,
            }}
          />
        ) : null}
      </LeafletMapView>

      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="pointer-events-none absolute top-3 right-3 z-30 flex flex-col gap-2">
          <MapControlButton label="Reset map view" onClick={resetMapView}>
            <CrosshairIcon />
          </MapControlButton>
          <MapControlButton
            label="Use my location"
            pressed={userLocation !== null}
            busy={locating}
            onClick={locate}
          >
            <LocateIcon />
          </MapControlButton>
        </div>

        <div className="pointer-events-none absolute top-3 right-16 left-16 z-20 flex flex-col gap-2">
          {houses.length === 0 ? (
            <StatusBanner message="No houses to show on this map yet." />
          ) : null}
          {tilesOk === false ? (
            <StatusBanner
              message="The street map did not load. House markers still work."
              actionLabel="Try again"
              onAction={retryTiles}
            />
          ) : null}
          {notice ? (
            <StatusBanner message={notice.message} actionLabel="Dismiss" onAction={() => setNotice(null)} />
          ) : null}
        </div>

        {selectedHouse ? (
          <HousePreviewSheet house={selectedHouse} onClose={() => setSelectedId(null)} />
        ) : null}
        {draft ? (
          <AddHouseSheet
            lat={draft.lat}
            lng={draft.lng}
            error={saveError}
            onCancel={cancelDraft}
            onSave={saveDraft}
          />
        ) : null}
        {!selectedHouse && !draft && !notice ? (
          <p className="pointer-events-none absolute inset-x-3 bottom-3 z-10 mx-auto max-w-sm rounded-full border border-candy-orange/30 bg-candy-black/90 px-3 py-2 text-center text-xs text-foreground/80">
            Tap the map to pin a house
          </p>
        ) : null}
      </div>
    </div>
  );
}

function StatusBanner({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div
      role="status"
      className="pointer-events-auto flex items-start gap-2 rounded-xl border border-candy-orange/30 bg-candy-black/95 px-3 py-2 text-sm text-foreground shadow-lg backdrop-blur-md"
    >
      <p className="flex-1">{message}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="min-h-11 shrink-0 px-1 font-semibold text-candy-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candy-orange"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function CrosshairIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" strokeLinecap="round" />
    </svg>
  );
}

function LocateIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" />
      <circle cx="12" cy="11" r="2" />
    </svg>
  );
}
