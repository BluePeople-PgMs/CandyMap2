import L from "leaflet";
import type { House } from "@/types";

function markerEmoji(house: House): string {
  const cleaned = (house.photoEmoji ?? "").replace(/[&<>"']/g, "").trim();
  return cleaned || "🎃";
}

/** Touch-sized Halloween pin. Drawn with HTML so we do not load marker images. */
export function createHouseMarkerIcon(house: House, selected: boolean): L.DivIcon {
  const size = selected ? 56 : 48;
  const state = selected ? " is-selected" : "";

  return L.divIcon({
    className: "candy-marker-root",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div class="candy-marker${state}"><span class="candy-marker-emoji">${markerEmoji(house)}</span></div>`,
  });
}

/** Pulsing pumpkin shown at the exact spot someone tapped, before they save. */
export function createDraftMarkerIcon(): L.DivIcon {
  const size = 56;

  return L.divIcon({
    className: "candy-marker-root",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div class="candy-marker is-draft"><span class="candy-marker-emoji">🎃</span></div>`,
  });
}
