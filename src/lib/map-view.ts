import { STORAGE_KEYS } from "./storage";

export type SavedMapView = {
  lat: number;
  lng: number;
  zoom: number;
};

export const MAP_ZOOM = {
  min: 2,
  max: 19,
} as const;

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/** Last place the person was looking. Missing or broken data falls back to the demo center. */
export function readSavedMapView(): SavedMapView | null {
  if (!canUseLocalStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.mapView);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const view = parsed as Partial<SavedMapView>;
    if (
      typeof view.lat !== "number" ||
      typeof view.lng !== "number" ||
      typeof view.zoom !== "number" ||
      !Number.isFinite(view.lat) ||
      !Number.isFinite(view.lng) ||
      !Number.isFinite(view.zoom) ||
      view.lat < -85 ||
      view.lat > 85
    ) {
      return null;
    }

    return {
      lat: view.lat,
      lng: view.lng,
      zoom: Math.min(MAP_ZOOM.max, Math.max(MAP_ZOOM.min, view.zoom)),
    };
  } catch {
    return null;
  }
}

export function writeSavedMapView(view: SavedMapView): void {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEYS.mapView, JSON.stringify(view));
  } catch {
    // The map still works if the browser refuses to store the camera.
  }
}
