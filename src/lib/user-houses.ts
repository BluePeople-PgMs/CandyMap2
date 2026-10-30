import type { House } from "../types/house";
import type { GeoBounds } from "../types/neighborhood";

/** Same ids as `CANDY_TAGS` in the candy types. The test locks the two lists together. */
const USER_CANDY_TAG_IDS = [
  "chocolates",
  "sour-candies",
  "gummies",
  "lollipops",
  "hard-candies",
  "caramels",
  "chewy-candies",
  "full-size-bars",
  "chips-snacks",
  "non-candy-treats",
] as const;

type UserCandyTag = (typeof USER_CANDY_TAG_IDS)[number];

function isUserCandyTag(value: string): value is UserCandyTag {
  return (USER_CANDY_TAG_IDS as readonly string[]).includes(value);
}

export const PINNED_NEIGHBORHOOD_ID = "pinned";
export const DEFAULT_HOUSE_NAME = "Halloween house";
const NAME_LIMIT = 80;

export type StoredUserHouse = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  candyTags: UserCandyTag[];
  neighborhoodId: string;
  createdAt: string;
};

type NeighborhoodBox = {
  id: string;
  bounds: GeoBounds;
};

/** Keep a longitude on the normal -180 to 180 line without changing the place it names. */
export function normalizeLongitude(lng: number): number {
  if (!Number.isFinite(lng)) {
    return Number.NaN;
  }

  // Leave an already-valid longitude untouched so the saved pin matches the tap exactly.
  if (lng >= -180 && lng <= 180) {
    return lng;
  }

  const wrapped = ((((lng + 180) % 360) + 360) % 360) - 180;
  return Object.is(wrapped, -0) ? 0 : wrapped;
}

export function isUserHouseId(id: string): boolean {
  return id.startsWith("house-user-");
}

/** First neighborhood box that contains the point, otherwise a generic pinned place. */
export function neighborhoodIdAt(
  lat: number,
  lng: number,
  neighborhoods: readonly NeighborhoodBox[],
): string {
  const match = neighborhoods.find((neighborhood) => {
    const { north, south, east, west } = neighborhood.bounds;
    return lat <= north && lat >= south && lng <= east && lng >= west;
  });

  return match?.id ?? PINNED_NEIGHBORHOOD_ID;
}

export function sanitizeCandyTags(tags: readonly string[]): UserCandyTag[] {
  const seen = new Set<string>();
  const ordered: UserCandyTag[] = [];

  for (const tag of tags) {
    if (!isUserCandyTag(tag) || seen.has(tag)) {
      continue;
    }

    seen.add(tag);
    ordered.push(tag);
  }

  return ordered;
}

export function buildUserHouse(input: {
  id?: string;
  name: string;
  lat: number;
  lng: number;
  candyTags: readonly string[];
  neighborhoodId: string;
  address?: string;
}): House | null {
  if (!Number.isFinite(input.lat) || input.lat < -90 || input.lat > 90) {
    return null;
  }

  const lng = normalizeLongitude(input.lng);
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    return null;
  }

  const id = input.id ?? `house-user-${crypto.randomUUID()}`;
  if (!isUserHouseId(id)) {
    return null;
  }

  const name = input.name.trim().slice(0, NAME_LIMIT).trim() || DEFAULT_HOUSE_NAME;

  return {
    id,
    name,
    address: input.address?.trim() || "Pinned on the map",
    lat: input.lat,
    lng,
    neighborhoodId: input.neighborhoodId.trim() || PINNED_NEIGHBORHOOD_ID,
    candyTypes: [],
    candyTags: sanitizeCandyTags(input.candyTags),
    photoEmoji: "🎃",
    ratingCount: 0,
    averages: { quality: 0, variety: 0, quantity: 0, overall: 0 },
    comments: [],
  };
}
