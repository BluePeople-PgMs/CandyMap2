import { MOCK_NEIGHBORHOODS } from "../data/neighborhoods";
import type { House } from "../types";
import { formatHouseName } from "./address";
import { getSeedHouseById, getSeedHouses } from "./catalog";
import { applyUserRatingsToHouses, createRating, scoresFromStars } from "./ratings";
import { STORAGE_KEYS, readUserRatings, writeUserRatings } from "./storage";
import {
  PINNED_NEIGHBORHOOD_ID,
  buildUserHouse,
  isUserHouseId,
  neighborhoodIdAt,
  normalizeLongitude,
  type StoredUserHouse,
} from "./user-houses";

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isStoredUserHouse(value: unknown): value is StoredUserHouse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const house = value as Partial<StoredUserHouse>;
  return (
    typeof house.id === "string" &&
    isUserHouseId(house.id) &&
    typeof house.name === "string" &&
    typeof house.lat === "number" &&
    typeof house.lng === "number" &&
    typeof house.neighborhoodId === "string" &&
    typeof house.createdAt === "string" &&
    Array.isArray(house.candyTags)
  );
}

function knownNeighborhoodId(id: string): string {
  if (id === PINNED_NEIGHBORHOOD_ID) {
    return id;
  }

  return MOCK_NEIGHBORHOODS.some((neighborhood) => neighborhood.id === id)
    ? id
    : PINNED_NEIGHBORHOOD_ID;
}

function readStoredUserHouses(): StoredUserHouse[] {
  if (!canUseLocalStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.userHouses);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isStoredUserHouse);
  } catch {
    return [];
  }
}

function writeStoredUserHouses(houses: readonly StoredUserHouse[]): boolean {
  if (!canUseLocalStorage()) {
    return false;
  }

  try {
    window.localStorage.setItem(STORAGE_KEYS.userHouses, JSON.stringify(houses));
    return true;
  } catch {
    return false;
  }
}

function storedToHouse(stored: StoredUserHouse): House | null {
  return buildUserHouse({
    id: stored.id,
    name: stored.name,
    lat: stored.lat,
    lng: stored.lng,
    candyTags: stored.candyTags.filter((tag) => typeof tag === "string"),
    neighborhoodId: knownNeighborhoodId(stored.neighborhoodId),
  });
}

type Listener = () => void;

const listeners = new Set<Listener>();
let snapshot: House[] | null = null;
let storageSyncStarted = false;

function loadMapHouses(): House[] {
  try {
    const seen = new Set<string>();
    const pinned: House[] = [];

    for (const stored of readStoredUserHouses()) {
      if (seen.has(stored.id) || getSeedHouseById(stored.id)) {
        continue;
      }

      const house = storedToHouse(stored);
      if (!house) {
        continue;
      }

      seen.add(house.id);
      pinned.push(house);
    }

    return applyUserRatingsToHouses(
      [...getSeedHouses(), ...pinned],
      readUserRatings(),
    ).filter((house) => Number.isFinite(house.lat) && Number.isFinite(house.lng));
  } catch {
    return getSeedHouses();
  }
}

function publishMapHouses(): void {
  snapshot = loadMapHouses();
  for (const listener of listeners) {
    listener();
  }
}

function ensureStorageSync(): void {
  if (storageSyncStarted || typeof window === "undefined") {
    return;
  }

  storageSyncStarted = true;
  window.addEventListener("storage", (event) => {
    if (
      event.key === STORAGE_KEYS.userHouses ||
      event.key === STORAGE_KEYS.userRatings ||
      event.key === null
    ) {
      publishMapHouses();
    }
  });
}

export function subscribeMapHouses(listener: Listener): () => void {
  ensureStorageSync();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Seed houses plus houses pinned on this device, with saved reviews applied. */
export function getMapHouses(): House[] {
  snapshot ??= loadMapHouses();
  return snapshot;
}

export function savePinnedHouse(input: {
  streetNumber: string;
  streetName: string;
  lat: number;
  lng: number;
  candyTags: readonly string[];
  stars: number;
}): { ok: true; houseId: string } | { ok: false; reason: "invalid" | "storage" } {
  const name = formatHouseName(input.streetNumber, input.streetName);
  const stars = input.stars;
  if (!name || !Number.isInteger(stars) || stars < 1 || stars > 5) {
    return { ok: false, reason: "invalid" };
  }

  const lng = normalizeLongitude(input.lng);
  const house = buildUserHouse({
    name,
    address: name,
    lat: input.lat,
    lng,
    candyTags: input.candyTags,
    neighborhoodId: neighborhoodIdAt(input.lat, lng, MOCK_NEIGHBORHOODS),
  });

  if (!house || (house.candyTags?.length ?? 0) === 0) {
    return { ok: false, reason: "invalid" };
  }

  const storedHouses = readStoredUserHouses();
  const next: StoredUserHouse = {
    id: house.id,
    name: house.name,
    lat: house.lat,
    lng: house.lng,
    candyTags: house.candyTags ?? [],
    neighborhoodId: house.neighborhoodId,
    createdAt: new Date().toISOString(),
  };

  if (!writeStoredUserHouses([...storedHouses, next])) {
    return { ok: false, reason: "storage" };
  }

  const rating = createRating(
    { houseId: house.id, ...scoresFromStars(stars) },
    { id: `rating-${house.id}-${crypto.randomUUID()}` },
  );
  if (!writeUserRatings([...readUserRatings(), rating])) {
    writeStoredUserHouses(storedHouses);
    return { ok: false, reason: "storage" };
  }

  publishMapHouses();
  return { ok: true, houseId: house.id };
}

function isWholeScore(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

/**
 * Save quality, variety, and quantity for a house already on the map.
 * Optional comment is stored with the rating and shown on the house screen.
 */
export function submitHouseRating(input: {
  houseId: string;
  quality: number;
  variety: number;
  quantity: number;
  comment?: string;
  authorName?: string;
}): boolean {
  if (
    !isWholeScore(input.quality) ||
    !isWholeScore(input.variety) ||
    !isWholeScore(input.quantity)
  ) {
    return false;
  }

  const exists =
    getSeedHouseById(input.houseId) !== undefined ||
    readStoredUserHouses().some((house) => house.id === input.houseId);

  if (!exists) {
    return false;
  }

  const rating = createRating(
    {
      houseId: input.houseId,
      quality: input.quality,
      variety: input.variety,
      quantity: input.quantity,
      comment: input.comment?.slice(0, 280),
      authorName: input.authorName?.trim() || "You",
    },
    { id: `rating-${input.houseId}-${crypto.randomUUID()}` },
  );
  const next = [...readUserRatings(), rating];
  if (!writeUserRatings(next)) {
    return false;
  }

  publishMapHouses();
  return true;
}

/** Add one 1–5 star review for a house that is already on the map. */
export function rateHouse(houseId: string, stars: number): boolean {
  if (!Number.isFinite(stars)) {
    return false;
  }

  const exists =
    getSeedHouseById(houseId) !== undefined ||
    readStoredUserHouses().some((house) => house.id === houseId);

  if (!exists) {
    return false;
  }

  const rating = createRating(
    { houseId, ...scoresFromStars(stars) },
    { id: `rating-${houseId}-${crypto.randomUUID()}` },
  );
  const next = [...readUserRatings(), rating];
  if (!writeUserRatings(next)) {
    return false;
  }

  publishMapHouses();
  return true;
}
